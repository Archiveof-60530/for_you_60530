import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, updateDoc, doc, increment, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDE3o38j0fwO62iaBO95dE1PgLy-bsWEE0",
  authDomain: "for-you-0530-6.firebaseapp.com",
  projectId: "for-you-0530-6",
  storageBucket: "for-you-0530-6.firebasestorage.app",
  messagingSenderId: "95046321320",
  appId: "1:95046321320:web:d140e14313bcbfe9c2ae9d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PASSWORD = "0530";
const CLOUD_NAME = "dw0ond9rl";
const UPLOAD_PRESET = "for_you";

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  return data.secure_url;
}

async function postEntry() {
  const pw = document.getElementById("pw").value;
  if (pw !== PASSWORD) return alert("パスワードが違います Wrong Password!");

  const text = document.getElementById("entry").value;
  if (!text) return alert("何も書かれていません");

  const imageFile = document.getElementById("image").files[0];
  let imageUrl = null;

  if (imageFile) {
    imageUrl = await uploadImage(imageFile);
  }

  await addDoc(collection(db, "entries"), {
    text: text,
    date: new Date().toLocaleString(),
    likes: 0,
    comments: [],
    imageUrl: imageUrl || null
  });

  document.getElementById("entry").value = "";
  document.getElementById("image").value = "";
  loadEntries();
}

async function likeEntry(id, btn) {
  const liked = JSON.parse(localStorage.getItem("liked") || "{}");
  if (liked[id]) return alert("Already Liked!");

  await updateDoc(doc(db, "entries", id), { likes: increment(1) });
  const currentLikes = parseInt(btn.dataset.likes || "0");
  btn.dataset.likes = currentLikes + 1;
  btn.innerText = `Like    ${currentLikes + 1}`;

  liked[id] = true;
  localStorage.setItem("liked", JSON.stringify(liked));
}

async function postComment(id) {
  const input = document.getElementById(`comment-input-${id}`);
  const text = input.value.trim();
  if (!text) return;

  await updateDoc(doc(db, "entries", id), {
    comments: arrayUnion({ text: text, date: new Date().toLocaleString() })
  });

  input.value = "";
  loadEntries();
}

async function loadEntries() {
  const diary = document.getElementById("diary");
  diary.innerHTML = "";

  const q = query(collection(db, "entries"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const id = docSnap.id;

    const commentsHTML = (d.comments || []).map(c =>
      `<div class="comment"><b>${c.date}</b>: ${c.text}</div>`
    ).join("");

    const imageHTML = d.imageUrl ? `<img src="${d.imageUrl}" style="max-width:100%; margin-top:10px;">` : "";

    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `
      <b>${d.date}</b>
      <p style="white-space: pre-wrap;">${d.text}</p>
      ${imageHTML}
      <button onclick="likeEntry('${id}', this)" data-likes="${d.likes}">Like    ${d.likes}</button>
      <div class="comments">${commentsHTML}</div>
      <input id="comment-input-${id}" type="text" placeholder="コメントを書く">
      <button onclick="postComment('${id}')">コメント投稿</button>
    `;
    diary.appendChild(div);
  });
}

window.postEntry = postEntry;
window.likeEntry = likeEntry;
window.postComment = postComment;

loadEntries();

