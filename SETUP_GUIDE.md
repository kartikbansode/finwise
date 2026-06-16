# FinWise India — Setup Guide (Start Here)

Follow these steps in exact order. Don't skip any.

## Step 1: Install the tools on your laptop (one time only)

1. **Install Node.js** — go to https://nodejs.org, download the "LTS" version, install it like any normal software. This lets your laptop run the website code.
2. **Install VS Code** — go to https://code.visualstudio.com, download and install. This is where you'll open and edit the code.
3. **Install Git** — go to https://git-scm.com/downloads, download and install. This is needed to upload your code to GitHub later.

Restart your laptop after installing all three.

## Step 2: Unzip and open the project

1. Download the `finwise-india-starter.zip` file I gave you.
2. Right-click it and "Extract All" to a simple location like `C:\Users\YourName\Documents\` (Windows) or your Desktop (Mac).
3. Open **VS Code**.
4. Click **File → Open Folder** and select the extracted `finwise-india` folder.

You should now see a list of files on the left side of VS Code — folders like `src`, files like `package.json`. This is your entire website's code.

## Step 3: Install the project's dependencies

1. In VS Code, click **Terminal → New Terminal** at the top menu. A black box appears at the bottom.
2. Type this exact command and press Enter:
   ```
   npm install
   ```
3. Wait 1-2 minutes. You'll see lots of text scroll — that's normal. When it stops and shows your cursor again, it's done.

## Step 4: Create your free Supabase account (this is your database)

1. Go to https://supabase.com and click "Start your project". Sign up with GitHub or email — it's free.
2. Click "New Project". Name it `finwise-india`. Choose a strong database password and **save it somewhere** — you won't need it for now but keep it safe. Choose the region closest to India (Mumbai/Singapore).
3. Wait about 2 minutes while Supabase sets up your project.
4. Once it's ready, click on the **gear/settings icon** in the left sidebar, then click **API**.
5. You'll see two things you need:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon public** key (a long string of letters and numbers)

Keep this browser tab open — you'll copy these in the next step.

## Step 5: Connect your project to Supabase

1. Back in VS Code, find the file called `.env.example` in the file list.
2. Right-click it and choose "Copy". Then right-click the folder area and "Paste". Rename the copy to exactly: `.env.local`
3. Open `.env.local` and replace the placeholder text with your real values from Step 4:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcxyz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_long_key_here
   ```
4. Save the file (Ctrl+S or Cmd+S).

## Step 6: Set up your database tables

1. Go back to your Supabase browser tab. Click **SQL Editor** in the left sidebar.
2. Click "New Query".
3. In VS Code, open the file `supabase/schema.sql`. Select everything (Ctrl+A) and copy it (Ctrl+C).
4. Paste it into the Supabase SQL editor box.
5. Click the green **RUN** button (bottom right).
6. You should see "Success. No rows returned." That means it worked.
7. Click **Table Editor** in the left sidebar — you should now see 4 tables: `profiles`, `income_entries`, `expense_entries`, `subscriptions`.

## Step 7: Turn on Google login (optional but recommended)

1. In Supabase, click **Authentication** in the left sidebar, then **Providers**.
2. Find **Google** in the list and toggle it on.
3. You'll need a Google Client ID and Secret — Supabase shows a link to Google Cloud Console with instructions. This takes about 5 minutes. If you want to skip this for now, email/password login already works without any setup.

## Step 8: Run your website on your own laptop

1. In the VS Code terminal, type:
   ```
   npm run dev
   ```
2. Wait a few seconds. You'll see a message saying something like "Local: http://localhost:3000"
3. Open your web browser and go to: `http://localhost:3000`

**Your website is now running on your own laptop.** You can sign up, log in, and add income entries. Every change you make in the code will show up here.

## Step 9: Put your website on the actual internet (for free)

1. Go to https://github.com and create a free account.
2. Create a new repository, name it `finwise-india`.
3. In VS Code terminal, type these commands one at a time:
   ```
   git init
   git add .
   git commit -m "First version of FinWise India"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL_HERE
   git push -u origin main
   ```
   (Replace `YOUR_GITHUB_REPO_URL_HERE` with the URL GitHub shows you after creating the repo.)
4. Go to https://vercel.com, sign up with your GitHub account.
5. Click "Add New Project", select your `finwise-india` repository.
6. Before clicking deploy, click "Environment Variables" and add the same two values from your `.env.local` file (the Supabase URL and key).
7. Click **Deploy**. Wait 2 minutes.

**You now have a real, live website with a real URL** that anyone in the world can visit and use.

## What to do next

Come back and ask me to build the next piece — the calculators page, the invoice generator, or the Razorpay payment integration. Each one will be added the same way: I create the files, explain what each does, and you just paste them in following these same steps.

## If something breaks

Copy the exact error message you see (in the terminal or browser) and send it to me. Don't try to guess-fix it yourself — paste the error and I'll tell you the exact fix.
