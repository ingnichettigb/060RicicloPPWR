<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Data (valutazioni, aziende incl. logo as data URL) lives in Lovable Cloud tables with per-user RLS, accessed from the browser client via src/lib/archivio.ts — sync across devices.
- App pages live under src/routes/_authenticated/; / is a public landing, /auth handles email+Google sign-in.

- Accesso: modulo autonomo in src/moduli/accesso-controllato (OTP su DB locale lead_emails, licenze/PUK/consensi/quota PDF su DB esterno via secret EXTERNAL_*); le rotte ne sono solo collegamenti — così il modulo resta riusabile su altre SaaS.
