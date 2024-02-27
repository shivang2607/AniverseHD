import { auth, db } from "../firebase/firebaseinit";
import Cookies from "js-cookie";
import { useContext, useState, createContext, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const FirebaseContext = createContext();

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function FirebaseProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [anime, setAnime] = useState();
  const [getCommentsAgain, setGetCommentsAgain] = useState(false);
  const [user, setCurrentUser] = useState();

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  //console.log("hyyy",user);

  // useEffect(() => {
  //   //updateLocalStorage(); 
  // }, []);


  const updateLocalStorage=async()=>{
    try{
      
      const data= await getUserData();

      const userLists = {
        favourites: data.favourites.concat(data.Mfavourites),
        completed: data.completed.concat(data.Mcompleted),
        dropped: data.dropped.concat(data.Mdropped),
        watching: data.watching.concat(data.Mreading),
        plan: data.planToWatch.concat(data.MplanToRead),
        onHold: data.onHold.concat(data.MonHold),
      };
      localStorage.setItem("userLists", JSON.stringify(userLists));

    }catch(e){
      console.log(e);
    }
    
  }

  async function getAnime(id) {
    try {
      const docRef = doc(db, "anime", id);

      const detail = await getDoc(docRef);
      return detail.data();
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  async function getManga(id) {
    try {
      const docRef = doc(db, "manga", id);

      const detail = await getDoc(docRef);
      return detail.data();
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  async function getOthersData(ref) {
    try {
      const data = await getDoc(ref);

      if (data.exists()) return data.data();
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  // JUST pass flag=false for manga and flag=true for anime, 'add' and 'remove' are strings with values from [dropped,completed,plan,watching,favourites,onHold], same for anime and manga

  async function updateUserLists(details, add=null, remove=null, flag = true) {

    const prev = "-1";
    if (!checkUserCookies()) return false;

    const userLists = JSON.parse(localStorage.getItem("userLists"));

    if(userLists===null){ 
      await updateLocalStorage();
      await updateUserLists(details,add,remove,flag);

    }else{
    
    try {
      const ref = doc(db, "users", getUserCookies().details.email);

      if (flag) {   
        const data = {
          id: details.id,
          imageUrl: details.main_picture,
          title: details.title_english?details.title_english:"NA",
          episodes: details.episodes? details.episodes:null,
          synopsis: details.synopsis?details.synopsis:"Not Available!!",
          type: details.type?details.type:"NA",
          type2: "Anime",
        };

        if (add != null) userLists[add].push(data);

        if (remove != null)
          userLists[remove].splice(
            userLists[remove].findIndex((e) => {
              e.type2 === "Anime" && e.id === details.id;
            }),
            1
          );


        if (remove === "favourites") {
          await updateDoc(ref, {
            favourites: arrayRemove(data),
          });
        } else if (add === "favourites") {
          await updateDoc(ref, {
            favourites: arrayUnion(data),
          });
        }

        if (add === "completed") {
          await updateDoc(ref, {
            completed: arrayUnion(data),
          });
        } else if (remove === "completed") {
          await updateDoc(ref, {
            completed: arrayRemove(data),
          });
        }

        if (add === "dropped") {
          await updateDoc(ref, {
            dropped: arrayUnion(data),
          });
        } else if (remove === "dropped") {
          await updateDoc(ref, {
            dropped: arrayRemove(data),
          });
        }

        if (add === "onHold") {
          await updateDoc(ref, {
            onHold: arrayUnion(data),
          });
        } else if (remove === "onHold") {
          await updateDoc(ref, {
            onHold: arrayRemove(data),
          });
        }

        if (add === "plan") {
          await updateDoc(ref, {
            planToWatch: arrayUnion(data),
          });
        } else if (remove === "plan") {
          await updateDoc(ref, {
            planToWatch: arrayRemove(data),
          });
        }

        if (add === "watching") {
          await updateDoc(ref, {
            watching: arrayUnion(data),
          });
        } else if (remove === "watching") {
          await updateDoc(ref, {
            watching: arrayRemove(data),
          });
        }
      localStorage.setItem("userLists", JSON.stringify(userLists));

      } else {
        
        const data = {
          id: details.manga_id,
          imageUrl: details.main_picture,
          title: details.title_english ? details.title_english : details.title,
          synopsis: details.synopsis?details.synopsis:"NOT Available",
          chapters: details.chapters?details.chapters:null,
          type: details.type?details.type:"NA",
          type2: "Manga",
        };

        if (add != null) userLists[add].push(data);

        if (remove != null)
          userLists[remove].splice(
            userLists[remove].findIndex((e) => {
              e.type2 === "Manga" && e.id === details.id;
            }),
            1
          );
        

        if (remove === "favourites") {
          await updateDoc(ref, {
            Mfavourites: arrayRemove(data),
          });
        } else if (add === "favourites") {
          await updateDoc(ref, {
            Mfavourites: arrayUnion(data),
          });
        }

        if (add === "completed") {
          await updateDoc(ref, {
            Mcompleted: arrayUnion(data),
          });
        } else if (remove === "completed") {
          await updateDoc(ref, {
            Mcompleted: arrayRemove(data),
          });
        }

        if (add === "dropped") {
          await updateDoc(ref, {
            Mdropped: arrayUnion(data),
          });
        } else if (remove === "dropped") {
          await updateDoc(ref, {
            Mdropped: arrayRemove(data),
          });
        }

        if (add === "onHold") {
          await updateDoc(ref, {
            MonHold: arrayUnion(data),
          });
        } else if (remove === "onHold") {
          await updateDoc(ref, {
            MonHold: arrayRemove(data),
          });
        }

        if (add === "plan") {
          await updateDoc(ref, {
            MplanToRead: arrayUnion(data),
          });
        } else if (remove === "plan") {
          await updateDoc(ref, {
            MplanToRead: arrayRemove(data),
          });
        }

        if (add === "watching") {
          await updateDoc(ref, {
            Mreading: arrayUnion(data),
          });
        } else if (remove === "watching") {
          await updateDoc(ref, {
            Mreading: arrayRemove(data),
          });
        }
        localStorage.setItem("userLists", JSON.stringify(userLists));
      }

      return true;
      //console.log("done");
    } catch (error) {
      console.log(error);
    }

  }
  }

  async function getUserData() {
    try {
      
      if (!checkUserCookies()) return false;
    //  console.log("cookies",getUserCookies());

      const docRef = doc(db, "users", getUserCookies().details.email);

      const data = await getDoc(docRef);

      //console.log("heyy");
      if (data.exists()) return data.data();
    } catch (error) {
      console.log("erroror: ", error);
    }
    return false;
  }

  async function signIn() {
    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
        auth_type: "reauthenticate",
      });
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      const checkUser = await getDoc(doc(db, "users", result.user.email));

      if (checkUser.data() == undefined) {
        await setDoc(doc(db, "users", result.user.email), {
          dateJoined: serverTimestamp(),
          username: result.user.displayName,
          email: result.user.email,
          photoUrl: result.user.photoURL,
          favourites: [],
          completed: [],
          watching: [],
          planToWatch: [],
          onHold: [],
          dropped: [],
          Mfavourites: [],
          Mcompleted: [],
          Mreading: [],
          MplanToRead: [],
          MonHold: [],
          Mdropped: [],
        });

        const userLists = {
          favourites: [],
          completed: [],
          dropped: [],
          watching: [],
          plan: [],
          onHold: [],
        };
       
        localStorage.setItem("userLists", JSON.stringify(userLists));

        Cookies.set(
          "user",
          JSON.stringify({
            token: token,
            email: result.user.email,
            name: result.user.displayName,
            photo: result.user.photoURL,
          }),
          { expires: 20 }
        );
      } else {
        const data= checkUser.data();
        const userLists = {
          favourites: data.favourites.concat(data.Mfavourites),
          completed: data.completed.concat(data.Mcompleted),
          dropped: data.dropped.concat(data.Mdropped),
          watching: data.watching.concat(data.Mreading),
          plan: data.planToWatch.concat(data.MplanToRead),
          onHold: data.onHold.concat(data.MonHold),
        };
       
        localStorage.setItem("userLists", JSON.stringify(userLists));
        Cookies.set(
          "user",
          JSON.stringify({
            token: token,
            email: checkUser.data().email,
            name: checkUser.data().username,
            photo: checkUser.data().photoUrl,
          }),
          { expires: 20 }
        );
      }

      window.location.reload();
    } catch (error) {
      console.log(error);
      const errorCode = error.code;
      const errorMessage = error.message;

      const credential = GoogleAuthProvider.credentialFromError(error);
    }
  }

  const addComment = async (text, animeId, parentId = null) => {
    // console.log(text,animeId,parentId);
    try {
      const userData = await getUserData();

      if (!checkUserCookies()) return false;

      const commentRef = await addDoc(
        collection(db, "discussion", animeId, "comments"),
        {
          isEdited: false,
          text,
          userName: userData.username,
          userEmail: userData.email,
          userPhoto: userData.photoUrl,
          commentedOn: serverTimestamp(),
          parentId: parentId,
        }
      );

      //console.log("Comment written with ID: ", commentRef.id);

      return commentRef;
    } catch (e) {
      console.log(e);
    }
    return undefined;
  };

  const editComment = async (
    text,
    animeId,
    commentId,
    replyId = null,
    isReply = false
  ) => {
    //needs to be updated
    

    if (user == null) return false;

    if (isReply) {
      if (!commentId || !replyId) {
        // console.log("Please Provide commendId and replyId !!");
        return null;
      }
      

      if (user == null) return false;

      const replyRef = doc(
        db,
        "discussion",
        animeId,
        "comments",
        commentId,
        "replies",
        replyId
      );
      await setDoc(
        replyRef,
        {
          isEdited: true,
          text,
          userEmail: user.email,
          userName: user.displayName,
          commentedOn: serverTimestamp(),
        },
        { merge: true }
      );

      //console.log("Reply edited with ID: ", replyRef.id);
      return replyRef;
    } else {
      const commentRef = doc(db, "discussion", animeId, "comments", commentId);
      await setDoc(
        commentRef,
        {
          isEdited: true,
          text,
          userEmail: user.email,
          userName: user.displayName,
          commentedOn: serverTimestamp(),
        },
        { merge: true }
      );

      //console.log("Comment edited with ID: ", commentRef.id);
      return commentRef;
    }
  };

  async function signout() {
    const auth = getAuth();

    signOut(auth)
      .then(() => {
        // setUser(null);
        Cookies.remove("user", { expires: 20 });
        window.location.reload();
        localStorage.clear();
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
  }

  async function getComments(animeId) {
    // console.log(animeId);
    try {
      const ref = collection(db, "discussion", animeId, "comments");
      const res = await getDocs(ref);
      return res;
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  function getUserCookies() {
    const user = Cookies.get("user");
    if (user) {
      const details = JSON.parse(user);
      return { details };
    }
    return false;
  }

  function checkUserCookies() {
    const user = Cookies.get("user");
    if (user) {
      return true;
    }
    return false;
  }

 async  function submitFeedback(starCnt, feed=""){
  if(starCnt===null)return;
  const {name, email} = getUserCookies().details;
  const promise = new Promise((resolve, reject)=>{
    try {
      resolve(setDoc(doc(db, "feedback", email),{
        name,
        stars:starCnt,
        feedback:feed,
        sumbittedAt: serverTimestamp(),
      }));
    } catch (error) {
      console.log("This is error",error)
      reject(error)
    }

  })
    return promise;
  }

  // const addComment = async (text, animeId, isReply=false, commentId=null)=>{
  //   const user= auth.currentUser;

  //   if(user==undefined) return false;

  //  if(isReply){
  //   if(!commentId){
  //     console.log("Please Provide commendId to add Reply !!");
  //     return null;
  //   }
  //   const replyRef = await addDoc(collection(db, "discussion", animeId, 'comments', commentId, 'replies'), {
  //     isEdited: false,
  //     text,
  //     userEmail: user.email,
  //     userName: user.displayName,
  //     commentedOn: serverTimestamp(),
  //     parentId: commentId
  //   });
  //   console.log("Reply written with ID: ", replyRef.id);
  //   return replyRef;
  //  }

  //  else{
  //   console.log(auth.currentUser)
  //   const commentRef = await addDoc(collection(db, "discussion", animeId, 'comments'), {
  //     isEdited: false,
  //     text,
  //     userEmail: user.email,
  //     userName: user.displayName,
  //     commentedOn: serverTimestamp(),
  //   });
  //   console.log("Comment written with ID: ", commentRef.id);
  //   return commentRef;
  //  }
  // }

  const value = {
    getAnime,
    signIn,
    addComment,
    editComment,
    signout,
    auth,
    getUserData,
    updateUserLists,
    getComments,
    anime,
    getCommentsAgain,
    setGetCommentsAgain,
    getUserCookies,
    getOthersData,
    checkUserCookies,
    submitFeedback,
    getManga,
    updateLocalStorage,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}
