import { collection, addDoc, getDocs, query, where, deleteDoc, arrayRemove } from "firebase/firestore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// 🔧 Create a new forest with 40 null owners
export const createForest = async (name) => {
    const forestsRef = collection(db, "forests");
  
    // Prevent duplicate names
    const q = query(forestsRef, where("name", "==", name));
    const snapshot = await getDocs(q);
  
    if (!snapshot.empty) {
      throw new Error("Forest already exists");
    }
  
    await addDoc(forestsRef, {
      name,
      owners: Array(40).fill(null), // ✅ Ensure this is correctly added
    });
  };
  

// 🔍 Fetch list of all forests
export const fetchAllForests = async () => {
  const forestsRef = collection(db, "forests");
  const snapshot = await getDocs(forestsRef); // ✅ getDocs ile düzeltildi
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
  }));
};

export async function fetchUserNameByEmail(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    return userDoc.data().name || null;
  }

  return null;
}

// 📄 Get full forest data by name
export const fetchForestByName = async (name) => {
  const q = query(collection(db, "forests"), where("name", "==", name));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const forestDoc = snapshot.docs[0];
    return {
      id: forestDoc.id,
      ...forestDoc.data()
    };
  } else {
    return null;
  }
};
  
  // 🔽 Tree Ekle
export const saveTreeToFirestore = async (forestId, treeData) => {
  const treesRef = collection(db, `forests/${forestId}/trees`);
  await addDoc(treesRef, treeData);
};

// 🌿 Ağaçları Yükle
export const fetchAllTreesForForest = async (forestId) => {
  const treesRef = collection(db, `forests/${forestId}/trees`);
  const snapshot = await getDocs(treesRef);
  const result = {};

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const key = `${data.gardenIndex}-${data.row}-${data.col}`;
    result[key] = {
      age: data.age,
      occupation: data.occupation,
    };
  });

  return result;
};

// 🗑️ Tree Sil
export const deleteTreeFromFirestore = async (forestId, gardenIndex, row, col) => {
  const treesRef = collection(db, `forests/${forestId}/trees`);
  const snapshot = await getDocs(treesRef);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (
      data.gardenIndex === gardenIndex &&
      data.row === row &&
      data.col === col
    ) {
      deleteDoc(doc(db, `forests/${forestId}/trees`, docSnap.id));
    }
  });
};

// 🔧 Admin: Kullanıcıyı sil ve sahipliğini sıfırla
export const deleteUserFromFirebase = async (userEmail, forestId) => {
  try {
    // 1. users koleksiyonundan kullanıcıyı bul
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn("Kullanıcı bulunamadı:", userEmail);
      return;
    }

    const userDoc = snapshot.docs[0];
    const userDocId = userDoc.id;

    // 2. Kullanıcıyı sil
    await deleteDoc(doc(db, "users", userDocId));

    // 3. forest içindeki owners listesinden kaldır
    const forestRef = doc(db, "forests", forestId);
    const forestSnap = await getDoc(forestRef);
    const forestData = forestSnap.data();

    const updatedOwners = forestData.owners.map((owner) =>
      owner === userEmail ? null : owner
    );

    await updateDoc(forestRef, {
      owners: updatedOwners,
    });

    console.log("✅ Kullanıcı silindi ve sahiplik sıfırlandı.");
  } catch (error) {
    console.error("🚨 Kullanıcı silinirken hata:", error);
  }
};
