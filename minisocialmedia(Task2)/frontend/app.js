const API = "http://localhost:3000/api";

// ---------------- REGISTER USER ----------------
async function registerUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful! Please login.");
        } else {
            alert(`Registration failed: ${data.error || 'Server error'}`);
        }
    } catch (error) {
        alert("Error connecting to server. Make sure backend is running.");
        console.error(error);
    }
}

// ---------------- LOGIN ----------------
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please enter both username and password");
        return;
    }

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", username);

            document.getElementById("auth-section").classList.add("hidden");
            document.getElementById("home-section").classList.remove("hidden");

            updateProfileBadge(username);
            loadPosts();
            loadUsersToFollow();
        } else {
            alert(`Login failed: ${data.error || 'Invalid credentials'}`);
        }
    } catch (error) {
        alert("Error connecting to server. Make sure backend is running.");
        console.error(error);
    }
}

// ---------------- LOGOUT ----------------
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("home-section").classList.add("hidden");

    document.getElementById("username").value = '';
    document.getElementById("password").value = '';
    document.getElementById("postContent").value = '';
    document.getElementById("posts").innerHTML = '';
    document.getElementById("posts-count").textContent = 'No posts yet';

    const followingList = document.getElementById("following-list");
    if (followingList) {
        followingList.innerHTML = '<span style="font-size:12px;color:#999;">You are not following anyone yet.</span>';
    }

    const followList = document.getElementById("follow-list");
    if (followList) {
        followList.innerHTML = '';
    }
}

// ---------------- UPDATE PROFILE BADGE ----------------
function updateProfileBadge(username) {
    const profileUsername = document.getElementById("profile-username");
    const profileInitial = document.getElementById("profile-initial");

    if (!profileUsername || !profileInitial) return;

    profileUsername.textContent = `@${username}`;
    profileInitial.textContent = username.charAt(0).toUpperCase();
}

// ---------------- CREATE POST ----------------
async function createPost() {
    const content = document.getElementById("postContent").value;
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to post.");
        return;
    }

    if (!content.trim()) {
        alert("Post content cannot be empty");
        return;
    }

    try {
        const res = await fetch(`${API}/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById("postContent").value = '';
            loadPosts();
        } else {
            alert(`Failed to create post: ${data.error || 'Server error'}`);
        }
    } catch (error) {
        alert("Error creating post. Check your connection.");
        console.error(error);
    }
}

// ---------------- LOAD POSTS ----------------
async function loadPosts() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to view posts.");
        return;
    }

    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");
    loader.textContent = "Loading posts...";

    try {
        const res = await fetch(`${API}/posts`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            displayPosts(data.posts || data);
        } else {
            alert(`Failed to load posts: ${data.error || 'Server error'}`);
        }
    } catch (error) {
        alert("Error loading posts. Check your connection.");
        console.error(error);
    } finally {
        loader.classList.add("hidden");
    }
}

// ---------------- DISPLAY POSTS ----------------
function displayPosts(posts) {
    const postsContainer = document.getElementById("posts");
    const postsCount = document.getElementById("posts-count");
    postsContainer.innerHTML = '';

    const count = posts && posts.length ? posts.length : 0;
    postsCount.textContent = count === 0 ? "No posts yet" :
        count === 1 ? "1 post" : `${count} posts`;

    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; color: #999;">No posts yet. Be the first to post!</p>';
        return;
    }

    posts.forEach(post => {
        const postCard = document.createElement("div");
        postCard.className = "post-card";

        const username = post.username || post.user?.username || "Anonymous";
        const content = post.content || "No content";
        const timestamp = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now";

        postCard.innerHTML = `
            <div class="post-header">
                <span class="post-username">@${username}</span>
                <span class="post-time">${timestamp}</span>
            </div>
            <div class="post-content">${content}</div>
            <div class="post-actions">
                <button class="btn-like" onclick="likePost('${post.id}')">
                    ❤️ Like (${post.likes || 0})
                </button>
                <button class="btn-comment" onclick="toggleComments('${post.id}')">
                    💬 Comment
                </button>
                ${post.userId === getCurrentUserId() ? `
                    <button class="btn-delete" onclick="deletePost('${post.id}')">
                        🗑️ Delete
                    </button>` : ''}
            </div>
            <div id="comments-${post.id}" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <div id="comment-list-${post.id}"></div>
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    <input type="text" id="comment-input-${post.id}" placeholder="Write a comment..." style="flex: 1; padding: 8px; margin: 0;">
                    <button onclick="addComment('${post.id}')" style="width: auto; padding: 8px 15px; margin: 0;">Send</button>
                </div>
            </div>
        `;

        postsContainer.appendChild(postCard);
    });
}

// ---------------- LIKE POST ----------------
async function likePost(postId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to like posts.");
        return;
    }

    try {
        const res = await fetch(`${API}/posts/like`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ postId })
        });

        const data = await res.json();

        if (res.ok) {
            loadPosts();
        } else {
            alert(`Failed to like post: ${data.error || 'Server error'}`);
        }
    } catch (error) {
        alert("Error liking post. Check your connection.");
        console.error(error);
    }
}

// ---------------- DELETE POST ----------------
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) {
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to delete posts.");
        return;
    }

    try {
        const res = await fetch(`${API}/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            loadPosts();
        } else {
            alert(`Failed to delete post: ${data.error || 'Server error'}`);
        }
    } catch (error) {
        alert("Error deleting post. Check your connection.");
        console.error(error);
    }
}

// ---------------- TOGGLE COMMENTS SECTION ----------------
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        loadComments(postId);
    } else {
        commentsSection.style.display = 'none';
    }
}

// ---------------- LOAD COMMENTS ----------------
async function loadComments(postId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    const commentList = document.getElementById(`comment-list-${postId}`);
    commentList.innerHTML = '<p style="font-size: 12px; color: #999;">Loading comments...</p>';

    try {
        const res = await fetch(`${API}/comments?postId=${postId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            displayComments(postId, data.comments || data);
        }
    } catch (error) {
        console.error("Error loading comments:", error);
        commentList.innerHTML = '<p style="font-size: 12px; color: #e74c3c;">Failed to load comments.</p>';
    }
}

// ---------------- DISPLAY COMMENTS ----------------
function displayComments(postId, comments) {
    const commentList = document.getElementById(`comment-list-${postId}`);
    commentList.innerHTML = '';

    const postComments = comments.filter(c => c.postId === postId);

    if (postComments.length === 0) {
        commentList.innerHTML = '<p style="font-size: 12px; color: #999;">No comments yet.</p>';
        return;
    }

    postComments.forEach(comment => {
        const commentDiv = document.createElement("div");
        commentDiv.style.cssText = "padding: 8px; background: #f9f9f9; border-radius: 5px; margin-bottom: 5px; font-size: 14px;";
        commentDiv.innerHTML = `
            <strong style="color: #3498db; font-size: 13px;">@${comment.username || 'Anonymous'}</strong>
            <p style="margin: 5px 0 0 0;">${comment.text}</p>
        `;
        commentList.appendChild(commentDiv);
    });
}

// ---------------- ADD COMMENT ----------------
async function addComment(postId) {
    const token = localStorage.getItem("token");
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const text = commentInput.value.trim();

    if (!token) {
        alert("You must be logged in to comment.");
        return;
    }

    if (!text) {
        alert("Comment cannot be empty.");
        return;
    }

    try {
        const res = await fetch(`${API}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ postId, text })
        });

        const data = await res.json();

        if (res.ok) {
            commentInput.value = '';
            loadComments(postId);
        } else {
            alert(`Failed to add comment: ${data.error || 'Server error'}`);
        }
    } catch (error) {
        alert("Error adding comment. Check your connection.");
        console.error(error);
    }
}

// ---------------- GET CURRENT USER ID ----------------
function getCurrentUserId() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch (error) {
        return null;
    }
}

// -------- LOAD USERS TO FOLLOW ----------
async function loadUsersToFollow() {
    const token = localStorage.getItem("token");
    const followList = document.getElementById("follow-list");
    const followingList = document.getElementById("following-list");
    if (!token || !followList || !followingList) return;

    followList.innerHTML = "Loading users...";
    followingList.innerHTML = "Loading following...";

    try {
        const resUsers = await fetch(`${API}/users`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const users = await resUsers.json();

        const resFollowing = await fetch(`${API}/users/following`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const following = await resFollowing.json();
        const followingIds = new Set(following.map(u => u.id));

        const myId = getCurrentUserId();
        followList.innerHTML = "";
        followingList.innerHTML = "";

        // People you may follow
        users
            .filter(u => u.id !== myId)
            .forEach(u => {
                const row = document.createElement("div");
                row.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;";

                const name = document.createElement("span");
                name.textContent = "@" + u.username;

                const btn = document.createElement("button");
                const isFollowing = followingIds.has(u.id);
                btn.textContent = isFollowing ? "Unfollow" : "Follow";
                btn.style.cssText = "padding:4px 10px;font-size:12px;border-radius:8px;border:none;cursor:pointer;background:#667eea;color:#fff;";
                btn.onclick = () => toggleFollow(u.id, isFollowing);

                row.appendChild(name);
                row.appendChild(btn);
                followList.appendChild(row);
            });

        if (followList.innerHTML.trim() === "") {
            followList.textContent = "No other users yet.";
        }

        // “You are following” list
        if (following.length === 0) {
            followingList.innerHTML = '<span style="font-size:12px;color:#999;">You are not following anyone yet.</span>';
        } else {
            following.forEach(u => {
                const item = document.createElement("div");
                item.textContent = "@" + u.username;
                item.style.cssText = "margin-bottom:4px;";
                followingList.appendChild(item);
            });
        }

    } catch (err) {
        console.error(err);
        followList.textContent = "Failed to load users.";
        followingList.textContent = "Failed to load following.";
    }
}

// -------- FOLLOW / UNFOLLOW ----------
async function toggleFollow(targetUserId, isFollowing) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to follow users.");
        return;
    }

    try {
        const res = await fetch(`${API}/users/${isFollowing ? "unfollow" : "follow"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ targetUserId })
        });
        const data = await res.json();

        if (res.ok) {
            loadUsersToFollow();
        } else {
            alert(data.error || "Action failed");
        }
    } catch (err) {
        console.error(err);
        alert("Network error");
    }
}

// ---------------- CHECK IF ALREADY LOGGED IN ----------------
window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
        document.getElementById("auth-section").classList.add("hidden");
        document.getElementById("home-section").classList.remove("hidden");
        updateProfileBadge(username);
        loadPosts();
        loadUsersToFollow();
    }
});
