---
author: Prateek
pubDatetime: 2025-10-25
title: Adding yourself as speaker
slug: adding-yourself-as-speaker
featured: true
draft: false
tags:
  - docs
description:
  Some rules to add yourself in Speakers page
---

Here's how you can add yourself to the Speakers page.

## Speaker profile

The speaker profile is written in YAML format with the following properties.


| Property              | Description                                                 | Remark                |
|-----------------------|-------------------------------------------------------------|-----------------------|
| **_name_**            | Your name                                                   | required<sup>\*</sup> |
| **_bio_**             | Anything that describes you. Keep it short.                 | optional              |
| **_linkedInURL_**     | Your LinkedIn profile link.                                 | recommended           |
| **_githubURL_**       | Link to your GitHub profile.                                | required<sup>\*</sup> |
| **_tags_**            | Topics or areas of expertise you speak about. Refer src/content/speakers/speaker-tags.md to add a relevant one               | optional              |
| **_speakerfolio_**    | Links for your past talks or presentations.                 | optional              |

### Sample profile
Create a new `YOUR_NAME.md` file at `src/content/speakers`. Copy and paste this in and edit accordingly.

```yaml
---
name: "Speaker Name"
bio: "A short bio"
linkedInURL: "https://www.linkedin.com/in/username/"
githubURL: "https://github.com/username"
tags:
  - devops
  - cloud
speakerfolio: 
  - name: "Ted Talk"
    url: "A link for the talk"
---
```

## Steps to Add Yourself

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

1. In your local repository, navigate to the `src/content/speakers` directory.
2. Create a new markdown file named `your_name.md`.
3. Add your speaker profile as described in the **Speaker profile** section above.

### Step 5: Commit and Push Your Changes

1. Add your changes to git:

    ```bash
    git add .
    ```

2. Commit your changes with a meaningful message:

    ```bash
    git commit -m "Add speaker profile for <your name>"
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

Once your pull request is reviewed and approved, your profile will be added to the Speakers page!
