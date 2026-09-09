# Run your portfolio

Open a new PowerShell window:

```powershell
cd "C:\Users\tjaqu\Desktop\PortfolioWebsite"
npm.cmd run dev -- --hostname 127.0.0.1
```

Open http://localhost:3000. Keep the terminal open. Press **Ctrl+C** to stop.

## Create your account

Open http://localhost:3000/admin/register. Choose your email, password, name, and portfolio address. You will go straight into onboarding. New accounts start empty.

If this is the first account, the optional checkbox can copy your existing portfolio into it. Leave the box unchecked for a blank start. Your original profile and real project remain preserved either way.

Return to http://localhost:3000/admin/login to sign in. Use your new account password; the old ADMIN_PASSWORD value is no longer used.

## Edit and preview

- Complete or skip the guided setup sections, then finish to open the dashboard.
- Choose software from the searchable Tools catalog, or type a custom tool and press Enter.
- Add education and experience entries, including descriptions.
- Upload photos and crop with drag handles or exact pixel values. Confirm with **Use this crop**.
- Add/edit projects and optional descriptions for individual gallery photos.
- Save your changes and click **Preview**. Your public account address is `/u/your-handle` after deployment.

**Dev tools** offers a separate optional showcase profile and a reset action requiring `RESET ALL`. Reset clears all account/content records; it makes a backup first and keeps uploaded image files. It is only available when running the development server.

For deployment, storage details, and quality commands, see `README.md`.

If Node/npm is not recognized, close and reopen the terminal. For the current session:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```
