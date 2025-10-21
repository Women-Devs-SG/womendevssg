---
author: Victoria Lo, Aishwarya Elango
pubDatetime: 2024-10-23T10:22:00Z
title: Adding yourself as a new member
slug: adding-yourself-as-member
featured: true
draft: false
tags:
  - docs
description:
  Some rules to add yourself in Members page
---

Here's how you can add yourself to the Members page.

## Member profile

The member profile is written in YAML format with the following properties.


| Property      | Description                                                      | Remark                |
|---------------|------------------------------------------------------------------|-----------------------|
| **_name_**    | Your name                                                        | required<sup>\*</sup> |
| **_bio_**     | Anything that describes you. Keep it short.                      | optional              |
| **_core_**    | Whether you are a core member (leader) or not. False by default. | optional              |
| **_socials_** | Array of your social media. Written in array yaml format.        | Github is required    |
| **_badges_**  | For core members, only. Describe your role.                      | optional              |

### Sample profile
Create a new `YOUR_NAME.md` file at `src/content/members`. Copy and paste this in and edit accordingly.

```yaml
---
name: "Regular Member"
bio: "This is my bio."
core: false
ally: false
socials:
  - name: "LinkedIn"
    href: "https://www.linkedin.com/in/victoria2666/"
  - name: "Twitter"
    href: "https://twitter.com/lo_victoria2666"
  - name: "Github"
    href: "https://github.com/victoria-lo"
---
```

## Other Social Media

We have more possible social media values you can add in your profile. Remember that the property is always `name` and `href`. Make sure `href` is a working link.

> Very important! `name` is case sensitive so be sure to write exactly as the list below.

List of possible `name` values:
- Github
- Facebook
- Instagram
- LinkedIn
- Mail
- Twitter
- Twitch
- YouTube
- WhatsApp
- Snapchat
- Pinterest
- TikTok
- CodePen
- Discord
- GitLab
- Reddit

## Getting Started 

# Prerequisities
- A Github Account 
- A text editor or IDE 
- Git installed on your machine (Alternatively, you can also use the web interface directly within your browser)

Setup (if not using the web interface)

### Step 1: Fork the Repository

1. Go to the repository on GitHub.
2. Click the **Fork** button at the top right corner. This will create a copy of the repository under your GitHub account.

### Step 2: Clone Your Forked Repository

1. On your forked repository page, click the **Code** button and copy the URL (either HTTPS or SSH).
2. Open your terminal and clone your fork locally by running the following command (replace `<your-fork-url>` with the URL you copied):

    ```bash
    git clone <your-fork-url>
    ```

3. Navigate into the project folder:

    ```bash
    cd <repository-name>
    ```

### Step 3: Create a New Branch

1. Before making changes, create a new branch to work on:

    ```bash
    git checkout -b add-<your-name>-profile
    ```

### Step 4: Add Your Profile

1. In your local repository, navigate to the `src/content/members` directory.
2. Create a new markdown file named `your_name.md`.
3. Add your member profile as described in the **Member profile** section above.

### Step 5: Commit and Push Your Changes

1. Add your changes to git:

    ```bash
    git add .
    ```

2. Commit your changes with a meaningful message:

    ```bash
    git commit -m "Add profile for <your name>"
    ```

3. Push your branch to your forked repository:

    ```bash
    git push origin add-your-profile
    ```

### Step 6: Create a Pull Request

1. Go back to your forked repository on GitHub.
2. Click on the **Compare & pull request** button that appears after pushing your changes.
3. Add a description to your pull request and make sure it is targeting the correct branch (usually `main` or `master`).
4. Submit the pull request.

---

Once your pull request is reviewed and approved, your profile will be added to the Members page!
