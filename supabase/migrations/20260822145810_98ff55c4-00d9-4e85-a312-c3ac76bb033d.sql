-- Catalog ---------------------------------------------------------------
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'movie',
  release_year INT,
  maturity_rating TEXT NOT NULL DEFAULT 'PG-13',
  duration_minutes INT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  cast_members TEXT[] NOT NULL DEFAULT '{}',
  poster_url TEXT NOT NULL,
  backdrop_url TEXT,
  stream_url TEXT NOT NULL,
  trailer_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_kids BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.titles TO anon, authenticated;
GRANT ALL ON public.titles TO service_role;
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "titles are public" ON public.titles FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.title_categories (
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (title_id, category_id)
);
GRANT SELECT ON public.title_categories TO anon, authenticated;
GRANT ALL ON public.title_categories TO service_role;
ALTER TABLE public.title_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "title_categories are public" ON public.title_categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  season INT NOT NULL DEFAULT 1,
  episode_number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_minutes INT,
  still_url TEXT,
  stream_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (title_id, season, episode_number)
);
GRANT SELECT ON public.episodes TO anon, authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "episodes are public" ON public.episodes FOR SELECT TO anon, authenticated USING (true);

-- Viewer profiles -------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#e50914',
  is_kids BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profiles" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX profiles_user_id_idx ON public.profiles(user_id);

CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, title_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist TO authenticated;
GRANT ALL ON public.watchlist TO service_role;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own watchlist" ON public.watchlist FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.watch_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title_id UUID NOT NULL REFERENCES public.titles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  position_seconds INT NOT NULL DEFAULT 0,
  duration_seconds INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, title_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watch_progress TO authenticated;
GRANT ALL ON public.watch_progress TO service_role;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.watch_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Subscriptions ---------------------------------------------------------
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  max_quality TEXT NOT NULL,
  max_screens INT NOT NULL DEFAULT 1,
  features TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans are public" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription" ON public.subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Demo data -------------------------------------------------------------
INSERT INTO public.subscription_plans (slug, name, price_cents, max_quality, max_screens, features, sort_order) VALUES
('basic','Basic',799,'720p',1,ARRAY['Watch on 1 device','720p HD','Ad-free'],1),
('standard','Standard',1399,'1080p',2,ARRAY['Watch on 2 devices','1080p Full HD','Downloads'],2),
('premium','Premium',1999,'4K + HDR',4,ARRAY['Watch on 4 devices','4K + HDR','Spatial audio','Downloads'],3);

INSERT INTO public.categories (slug, name, sort_order) VALUES
('trending','Trending Now',1),
('originals','Nova Originals',2),
('action','Action & Adventure',3),
('sci-fi','Sci-Fi & Fantasy',4),
('documentaries','Documentaries',5),
('kids','Kids & Family',6);

INSERT INTO public.titles (slug, name, description, kind, release_year, maturity_rating, duration_minutes, genres, cast_members, poster_url, backdrop_url, stream_url, trailer_url, is_featured, is_kids) VALUES
('the-last-signal','The Last Signal','A deep-space engineer intercepts a transmission from a ship that vanished forty years ago — and it is broadcasting her own voice.','series',2026,'TV-MA',NULL,ARRAY['Sci-Fi','Thriller'],ARRAY['Ana Kovaite','Marius Dane','Lena Ford'],'/__l5e/assets-v1/05da9ced-450e-4bf5-a010-dbc9a71cf33c/p1.jpg','/__l5e/assets-v1/3735c3e1-2496-42b4-8817-0b49f1f72cc5/b1.jpg','https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8','https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',true,false),
('midnight-district','Midnight District','A burned-out detective works the neon underbelly of a city that never sleeps, hunting a killer who leaves no shadow.','movie',2025,'R',118,ARRAY['Crime','Thriller'],ARRAY['Tomas Reidas','Ivy Chan'],'/__l5e/assets-v1/6515e867-975f-4d3d-9029-14b59b17e5c0/p2.jpg','/__l5e/assets-v1/72d4ae05-1b9d-4364-85be-3d7b1699d9da/b2.jpg','https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_hevc/master.m3u8',NULL,false,false),
('iron-horizon','Iron Horizon','Two rival pilots must fly one impossible mission together across a collapsing frontier.','movie',2026,'PG-13',132,ARRAY['Action','Adventure'],ARRAY['Rasa Milne','Ken Ozawa'],'/__l5e/assets-v1/b8f7273b-4ec3-4fcb-856b-1f9b4346e8d1/p3.jpg','/__l5e/assets-v1/3735c3e1-2496-42b4-8817-0b49f1f72cc5/b1.jpg','https://test-streams.mux.dev/tos_ismc/main.m3u8',NULL,false,false),
('the-glass-orchard','The Glass Orchard','A family inherits a greenhouse where every plant remembers a secret they tried to bury.','series',2025,'TV-14',NULL,ARRAY['Drama','Mystery'],ARRAY['Elena Prieto','Sam Whitlock'],'/__l5e/assets-v1/ff6fe49e-093b-4d79-ab1b-0e56f4bdcbd6/p4.jpg','/__l5e/assets-v1/72d4ae05-1b9d-4364-85be-3d7b1699d9da/b2.jpg','https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',NULL,false,false),
('deep-blue-drift','Deep Blue Drift','A year beneath the ice with the researchers mapping the ocean we have never seen.','movie',2024,'TV-G',94,ARRAY['Documentary','Nature'],ARRAY['Narrated by Owen Hale'],'/__l5e/assets-v1/ae8411bd-2c18-4955-ac40-41362334d14c/p5.jpg',NULL,'https://test-streams.mux.dev/tos_ismc/main.m3u8',NULL,false,false),
('paper-lanterns','Paper Lanterns','A shy inventor and a talking fox build a machine that can carry wishes to the sky.','movie',2026,'G',88,ARRAY['Animation','Family'],ARRAY['Mika Toll','Bea Rowe'],'/__l5e/assets-v1/1eb5f411-b220-4f61-9305-8a92a922f0be/p6.jpg',NULL,'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',NULL,false,true),
('crown-of-ash','Crown of Ash','In a kingdom fed by a dying star, the last heir must choose between the throne and the light.','series',2026,'TV-MA',NULL,ARRAY['Fantasy','Drama'],ARRAY['Nora Vale','Idris Kane'],'/__l5e/assets-v1/0d8b4fd1-8541-4116-a81b-638aaa510d6c/p7.jpg','/__l5e/assets-v1/3735c3e1-2496-42b4-8817-0b49f1f72cc5/b1.jpg','https://test-streams.mux.dev/tos_ismc/main.m3u8',NULL,false,false),
('static-hearts','Static Hearts','Two strangers keep meeting inside a radio broadcast that should not exist.','movie',2025,'PG-13',105,ARRAY['Romance','Sci-Fi'],ARRAY['Jonas Beal','Amara Lin'],'/__l5e/assets-v1/ee1d963e-c9b9-4d03-9f6b-eb75ce41bf16/p8.jpg',NULL,'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',NULL,false,false);

INSERT INTO public.title_categories (title_id, category_id)
SELECT t.id, c.id FROM public.titles t, public.categories c WHERE
  (c.slug='trending' AND t.slug IN ('the-last-signal','midnight-district','iron-horizon','crown-of-ash','static-hearts','the-glass-orchard'))
  OR (c.slug='originals' AND t.slug IN ('the-last-signal','the-glass-orchard','crown-of-ash','paper-lanterns'))
  OR (c.slug='action' AND t.slug IN ('iron-horizon','midnight-district','crown-of-ash'))
  OR (c.slug='sci-fi' AND t.slug IN ('the-last-signal','static-hearts','iron-horizon'))
  OR (c.slug='documentaries' AND t.slug IN ('deep-blue-drift'))
  OR (c.slug='kids' AND t.slug IN ('paper-lanterns','deep-blue-drift'));

INSERT INTO public.episodes (title_id, season, episode_number, name, description, duration_minutes, still_url, stream_url)
SELECT t.id, 1, e.n, e.nm, e.d, e.mins, t.backdrop_url, 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
FROM public.titles t
JOIN (VALUES
  (1,'Carrier Wave','A routine relay shift picks up a voice that should not be there.',52),
  (2,'Forty Years of Silence','The crew traces the signal to a ship declared lost in 1986.',48),
  (3,'Echo Protocol','Following the signal means switching off the only thing keeping them alive.',55)
) AS e(n,nm,d,mins) ON true
WHERE t.slug='the-last-signal';

INSERT INTO public.episodes (title_id, season, episode_number, name, description, duration_minutes, still_url, stream_url)
SELECT t.id, 1, e.n, e.nm, e.d, e.mins, t.backdrop_url, 'https://test-streams.mux.dev/tos_ismc/main.m3u8'
FROM public.titles t
JOIN (VALUES
  (1,'Inheritance','The greenhouse door opens for the first time in thirty years.',46),
  (2,'Nightshade','A plant blooms on the exact anniversary of a disappearance.',44)
) AS e(n,nm,d,mins) ON true
WHERE t.slug='the-glass-orchard';

INSERT INTO public.episodes (title_id, season, episode_number, name, description, duration_minutes, still_url, stream_url)
SELECT t.id, 1, e.n, e.nm, e.d, e.mins, t.backdrop_url, 'https://test-streams.mux.dev/tos_ismc/main.m3u8'
FROM public.titles t
JOIN (VALUES
  (1,'The Dying Star','The heir is crowned in a hall of cooling embers.',58),
  (2,'Ashfall','A rebellion begins in the mines beneath the palace.',54)
) AS e(n,nm,d,mins) ON true
WHERE t.slug='crown-of-ash';