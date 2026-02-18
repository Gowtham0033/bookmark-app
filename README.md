📌 Bookmark App

A full-stack bookmark management application that allows users to securely save, manage, and organize useful links. The application uses Supabase for backend services including database, authentication, and real-time updates.

🚀 Tech Stack

Frontend: React.js

Backend Services: Supabase

Database: PostgreSQL (via Supabase)

Authentication: Supabase Auth (Email + OAuth)

Hosting: (Add your hosting platform if deployed)

✨ Features

User authentication (Sign up / Login)

Add, delete, and view bookmarks

Secure user-specific data access

Real-time updates for bookmark changes

Protected routes for authenticated users

🧠 Architecture Overview

React frontend communicates directly with Supabase.

Supabase handles:

PostgreSQL database

Authentication

API auto-generation

Row Level Security (RLS)

Each user can only access their own bookmarks via RLS policies.

🔍 Challenges Faced & Solutions
1️⃣ Real-Time Data Not Updating
Problem:

After inserting a new bookmark, the UI was not updating in real time. A manual page refresh was required.

Root Cause:

Data was fetched only once using useEffect() on component mount. No real-time subscription was implemented.

Solution:

Implemented Supabase real-time subscription using:

supabase.channel()

postgres_changes listener

Now the UI updates instantly when bookmarks are inserted or deleted.

2️⃣ Row Level Security (RLS) Blocking Inserts
Problem:

Bookmark insertion failed even though the user was authenticated.

Root Cause:

RLS was enabled but no insert policy was defined for authenticated users.

Solution:

Created proper RLS policies in Supabase:

Allow authenticated users to insert rows where:
auth.uid() = user_id

Allow users to select only their own rows.

This ensured secure, user-isolated data access.

3️⃣ OAuth (Google Auth) Redirect Issues
Problem:

After Google login, users were not redirected correctly to the application.

Root Cause:

Redirect URLs were not configured properly in Supabase Auth settings.

Solution:

Configured:

Site URL

Redirect URLs

OAuth provider credentials

This resolved authentication flow issues.

4️⃣ Handling State After Insert
Problem:

Even after successful insertion, bookmarks were not reflected immediately.

Solution:

Updated React state directly after insert:

Used .select() after insert

Appended returned data to state array

This improved UI responsiveness.

🔐 Security Considerations

Row Level Security enabled

User-specific data isolation

JWT-based authentication

No sensitive keys exposed in frontend

📈 Future Improvements

Add bookmark categories/tags

Implement search & filter functionality

Add pagination for scalability

Improve UI/UX design

Add edit bookmark feature

🏁 Conclusion

This project strengthened understanding of:

Backend-as-a-Service architecture

Authentication flows

Real-time systems

Secure database policies

State synchronization in React
