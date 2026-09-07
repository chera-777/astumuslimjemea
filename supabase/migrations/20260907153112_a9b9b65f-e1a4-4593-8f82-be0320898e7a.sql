
DROP TRIGGER IF EXISTS trg_apply_xp_event ON public.xp_events;
CREATE TRIGGER trg_apply_xp_event
  AFTER INSERT ON public.xp_events
  FOR EACH ROW EXECUTE FUNCTION public.apply_xp_event();
