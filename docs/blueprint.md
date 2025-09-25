# **App Name**: Q&A Hub

## Core Features:

- User Authentication: Enable users to sign up and log in with email, username, and securely hashed passwords.
- Profile Creation: Allow users to create a profile with a unique link (domain.com/u/{username}) and a bio.
- Anonymous Question Submission: Enable anonymous users to submit questions via a user's profile link.
- Dashboard: Provide a dashboard where logged-in users can view, answer, delete, and report questions.
- Public Profile Display: Show answered questions on the user's public profile page.
- Question Moderation Tool: Implement an AI tool to help users identify and delete inappropriate questions based on their content. LLM identifies toxicity and other violations of the guidelines. 
- Database Integration: Use MongoDB to store users and questions, ensuring data persistence.

## Style Guidelines:

- Primary color: Light blue (#A0D2EB) to evoke a sense of calm and trust.
- Background color: Very light blue (#F0F8FF) to create a clean and open feel.
- Accent color: Soft purple (#B39DDB) to add a touch of sophistication and modernity.
- Body and headline font: 'PT Sans', a humanist sans-serif for a modern look and readability.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, clear icons to represent actions like answering, deleting, and reporting questions.
- Maintain a minimal and clean layout with a profile card at the top and answered questions displayed in a list below.