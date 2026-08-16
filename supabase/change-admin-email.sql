-- Safely authorize the new Fresh Kind CMS administrator.
-- This migration changes RLS policies only. It does not alter or delete data.
-- It is safe to run more than once.

do $migration$
begin
  if to_regclass('public.site_content') is not null then
    execute 'drop policy if exists "Fresh Kind admin can add content" on public.site_content';
    execute $policy$
      create policy "Fresh Kind admin can add content"
      on public.site_content for insert to authenticated
      with check (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
    $policy$;

    execute 'drop policy if exists "Fresh Kind admin can update content" on public.site_content';
    execute $policy$
      create policy "Fresh Kind admin can update content"
      on public.site_content for update to authenticated
      using (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
      with check (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
    $policy$;

    execute 'drop policy if exists "Fresh Kind admin can remove content" on public.site_content';
    execute $policy$
      create policy "Fresh Kind admin can remove content"
      on public.site_content for delete to authenticated
      using (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
    $policy$;
  else
    raise notice 'Skipping site_content policies: public.site_content does not exist.';
  end if;

  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists "Fresh Kind admin can upload assets" on storage.objects';
    execute $policy$
      create policy "Fresh Kind admin can upload assets"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'site-assets'
        and lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com'
      )
    $policy$;

    execute 'drop policy if exists "Fresh Kind admin can update assets" on storage.objects';
    execute $policy$
      create policy "Fresh Kind admin can update assets"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'site-assets'
        and lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com'
      )
      with check (
        bucket_id = 'site-assets'
        and lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com'
      )
    $policy$;

    execute 'drop policy if exists "Fresh Kind admin can delete assets" on storage.objects';
    execute $policy$
      create policy "Fresh Kind admin can delete assets"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'site-assets'
        and lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com'
      )
    $policy$;
  else
    raise notice 'Skipping Storage policies: storage.objects does not exist.';
  end if;

  if to_regclass('public.products') is not null then
    execute 'drop policy if exists "Public can view active products" on public.products';
    execute $policy$
      create policy "Public can view active products"
      on public.products for select
      using (
        is_active = true
        or lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com'
      )
    $policy$;

    execute 'drop policy if exists "Fresh Kind admin can add products" on public.products';
    execute $policy$
      create policy "Fresh Kind admin can add products"
      on public.products for insert to authenticated
      with check (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
    $policy$;

    execute 'drop policy if exists "Fresh Kind admin can update products" on public.products';
    execute $policy$
      create policy "Fresh Kind admin can update products"
      on public.products for update to authenticated
      using (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
      with check (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
    $policy$;

    execute 'drop policy if exists "Fresh Kind admin can delete products" on public.products';
    execute $policy$
      create policy "Fresh Kind admin can delete products"
      on public.products for delete to authenticated
      using (lower(auth.jwt() ->> 'email') = 'afridahamed110@gmail.com')
    $policy$;
  else
    raise notice 'Skipping product policies: public.products does not exist.';
  end if;
end
$migration$;
