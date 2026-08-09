CREATE POLICY "Empresa ve curriculo de candidatos"
ON public.resumes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.vacancies v ON v.id = a.vacancy_id
    WHERE a.candidate_id = public.resumes.user_id
      AND public.is_company_member(v.company_id, auth.uid())
  )
);