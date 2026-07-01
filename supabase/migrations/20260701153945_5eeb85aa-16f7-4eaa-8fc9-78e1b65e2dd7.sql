CREATE TABLE public.luna_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  parts JSONB,
  mood TEXT,
  reacted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX luna_messages_user_created_idx ON public.luna_messages(user_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.luna_messages TO authenticated;
GRANT ALL ON public.luna_messages TO service_role;
ALTER TABLE public.luna_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own luna messages" ON public.luna_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);