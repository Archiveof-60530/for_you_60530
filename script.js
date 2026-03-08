// Firebase SDKの読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase設定（君のやつ）
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

const PASSWORD = "0530"; // ←好きなパスワードに変えてOK

// 投稿する
async function postEntry() {
  const pw = document.getElementById("pw").value;
  if (pw !== PASSWORD) return alert("パスワードが違います！");

  const text = document.getElementById("entry").value;
  if (!text) return alert("何も書かれていません");

  await addDoc(collection(db, "entries"), {
    text: text,
    date: new Date().toLocaleString(),
    likes: 0
  });

  document.getElementById("entry").value = "";
  loadEntries();
}

// いいね
async function likeEntry(id, btn) {
  await updateDoc(doc(db, "entries", id), { likes: increment(1) });
  btn.innerText = `👍 ${parseInt(btn.innerText.split(" ")[1]) + 1}`;
}

// 投稿一覧を読み込む
async function loadEntries() {
  const diary = document.getElementById("diary");
  diary.innerHTML = "";

  const q = query(collection(db, "entries"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `<b>${d.date}</b><p>${d.text}</p><button onclick="likeEntry('${docSnap.id}', this)">👍 ${d.likes}</button>`;
    diary.appendChild(div);
  });
}

// グローバルに関数を公開
window.postEntry = postEntry;
window.likeEntry = likeEntry;

// ページ読み込み時に投稿一覧表示
loadEntries();