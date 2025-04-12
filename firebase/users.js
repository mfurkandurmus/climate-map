import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
  } from "firebase/firestore";
  import { db } from "./firebaseConfig";
  
  // 🔐 Register a new user
  export const registerUser = async ({ name, surname, email, password, forestName }) => {
    const usersRef = collection(db, "users");
  
    // Step 1: Get used garden indices in selected forest
    const q = query(usersRef, where("forestName", "==", forestName));
    const snapshot = await getDocs(q);
    const usedIndices = snapshot.docs.map((doc) => doc.data().gardenIndex);
    const availableIndices = Array.from({ length: 40 }, (_, i) => i).filter(
      (i) => !usedIndices.includes(i)
    );
    if (availableIndices.length === 0) {
      throw new Error("No available gardens");
    }
  
    // Step 2: Assign a random available garden
    const assignedGarden = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  
    // Step 3: Add user document
    const docRef = await addDoc(usersRef, {
      name,
      surname,
      email,
      password,
      forestName,
      gardenIndex: assignedGarden,
    });
  
    // Step 4: Update forest's owner list
    const forestsRef = collection(db, "forests");
    const forestQuery = query(forestsRef, where("name", "==", forestName));
    const forestSnapshot = await getDocs(forestQuery);
  
    // Step 4: Update forest's owner list
if (!forestSnapshot.empty) {
    const forestDoc = forestSnapshot.docs[0];
    const forestData = forestDoc.data();
  
    const updatedOwners = Array.isArray(forestData.owners)
      ? [...forestData.owners]
      : Array(40).fill(null); // ✅ Default fallback
  
    updatedOwners[assignedGarden] = email;
  
    await updateDoc(doc(db, "forests", forestDoc.id), {
      owners: updatedOwners,
    });
  }
  
  
    return {
      name,
      surname,
      email,
      forestName,
      gardenIndex: assignedGarden,
      id: docRef.id,
    };
  };
  
  // 🔓 Log in an existing user
  export const loginUser = async ({ email, password, forestName }) => {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("email", "==", email),
      where("password", "==", password),
      where("forestName", "==", forestName)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("Invalid credentials");
  
    const data = snapshot.docs[0].data();
    return { ...data, id: snapshot.docs[0].id };
  };
  
  // 🔎 Get the user's garden index
  export const getUserGarden = async (userId) => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(query(usersRef, where("id", "==", userId)));
    if (snapshot.empty) return null;
    return snapshot.docs[0].data().gardenIndex;
  };
  
  // 💾 Get user info from localStorage
  export const getUserFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("climate_user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  };
  
  