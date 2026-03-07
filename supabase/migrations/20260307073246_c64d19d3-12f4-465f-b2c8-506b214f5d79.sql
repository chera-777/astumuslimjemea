
-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'amir', 'committee', 'student', 'guest');

-- Create universities table
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read universities" ON public.universities FOR SELECT USING (true);

-- Insert default universities
INSERT INTO public.universities (name, short_name, city) VALUES
  ('Adama Science and Technology University', 'ASTU', 'Adama'),
  ('Addis Ababa University', 'AAU', 'Addis Ababa'),
  ('Jimma University', 'JU', 'Jimma'),
  ('Bahir Dar University', 'BDU', 'Bahir Dar'),
  ('Haramaya University', 'HU', 'Haramaya'),
  ('Mekelle University', 'MU', 'Mekelle');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  university_id UUID REFERENCES public.universities(id) NOT NULL,
  department TEXT,
  batch_year TEXT,
  student_id TEXT,
  is_cafe_student BOOLEAN DEFAULT false,
  profile_photo_url TEXT,
  id_card_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create user_roles table (separate from profiles per security guidelines)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  sector TEXT, -- for amirs: main, qiraat, academic, financial, social
  university_id UUID REFERENCES public.universities(id),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create news table (university-scoped)
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  university_id UUID REFERENCES public.universities(id) NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Get user university function
CREATE OR REPLACE FUNCTION public.get_user_university(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT university_id FROM public.profiles WHERE id = _user_id
$$;

CREATE POLICY "Users see own university news" ON public.news FOR SELECT TO authenticated
  USING (university_id = public.get_user_university(auth.uid()));
CREATE POLICY "Admins/Amirs can create news" ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'amir'));

-- Create khadim_registrations table
CREATE TABLE public.khadim_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  university_id UUID REFERENCES public.universities(id) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('ramadan', 'regular')),
  preferred_roles TEXT[] DEFAULT '{}',
  availability_notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.khadim_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own khadim reg" ON public.khadim_registrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can register as khadim" ON public.khadim_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage khadims" ON public.khadim_registrations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create khadim_schedule table
CREATE TABLE public.khadim_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  khadim_id UUID REFERENCES public.khadim_registrations(id) ON DELETE CASCADE NOT NULL,
  assigned_date DATE NOT NULL,
  assigned_role TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('iftar', 'suhoor', 'both')),
  university_id UUID REFERENCES public.universities(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.khadim_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own schedule" ON public.khadim_schedule FOR SELECT TO authenticated
  USING (khadim_id IN (SELECT id FROM public.khadim_registrations WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage schedule" ON public.khadim_schedule FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES auth.users(id),
  university_id UUID REFERENCES public.universities(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  campaign TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own donations" ON public.donations FOR SELECT TO authenticated USING (donor_id = auth.uid());
CREATE POLICY "Users can donate" ON public.donations FOR INSERT TO authenticated WITH CHECK (donor_id = auth.uid());

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
