import Image from "next/image";
import React, { useEffect, useState } from "react";
import { debounceGetComments, getCommentById } from "./utilFunctions";
import CommentCard from "./CommentCard";
import InputCommentDiv from "./InputCommentDiv";
import { RotatingLines, TailSpin } from "react-loader-spinner";

export default function CommentsContainer({
  animeId,
  loggedInUserId,
  loggedInUserData,
  epNo,
  gogoEpId,
  zoroEpId,
}) {
  // const {loggedInUserId, loggedInUserData} = useUserStore();
  // console.log("loggedInUserData", loggedInUserData);
  const [loadingStates, setLoadingStates] = useState({
    hasOnceLoaded: false, //this state has only one function, this tells wether the api has called even once otherwise before the first call on UI its shown that no comments are there.
    loadMore: false,
    noMoreComments: false, //not a loader, but a state which tells that all the comments available with the given paramters have been fetched from the database
  });
  const [commentHashId, setCommentHashId] = useState(null);
  const [hashCommentData, setHashCommentData] = useState(null); //this is the data of the comment which has the hash id, this is used to scroll to that comment when the page loads or when the user clicks on a notification which has a comment id in it.

  const [commentsData, setCommentsData] = useState([]);
  const [params, setParams] = useState({
    animeId: animeId,
    userId: loggedInUserId,
    epNo: epNo,
    orderBy: null,
    limit: 10,
    offset: 0,
  });
  const [commentPayload, setCommentPayload] = useState({
    animeId: animeId,
    userId: null,
    commentBody: "",
    epNo: epNo,
    userName: loggedInUserData?.userName || "",
    isSpoiler: false,
    gogoEpId: gogoEpId,
    zoroEpId: zoroEpId,
  });

  // useEffect(() => {
    
  
  //   return () => {
  //     console.log("comment hash id=> ", window?.location?.hash);
  //     setCommentHashId(window?.location?.hash?.split('-')?.pop());
  //   }
  // }, [])
  


  useEffect(() => {
    (async () => {
      setCommentPayload((prev) => ({
        ...prev,
        userId: loggedInUserId,
        userName: loggedInUserData?.userName || "",
        zoroEpId,
        gogoEpId,
        epNo,
      }));
      setCommentHashId(window?.location?.hash?.split('-')?.pop()); //ye hash id us comment ki h jisko alag se fetch krke vaha tk scroll  krna h...so in case notifiation k through koi comment pr click krega to uski parent comment ki hash id h ye and we have to fetch that comment separately and scroll to it. Iska bhi khayaal rakha gaya h ki if the comment with this hash id already exists in the commentsData that is initially fetched by the flow then vo nahi dikhe...because ye comment sbse uper dikhana h hmko. ! the thing to be noted is that this comment id is not of the reply comment id but of the parent comment id.
      if(commentHashId) {
      const hashCommentData = await fetchCommentById();
      setHashCommentData(hashCommentData);
      
    }

      // console.log("speaking from comments container useEffect", loggedInUserData);

      //? For below code only loggedInUserId was needed as trigger but since we have implemented debounce function of 500ms delay this shouldn't cause any issue.
      if (!epNo) return;
      setParams((prev) => ({ ...prev, userId: loggedInUserId, epNo: epNo }));
    })();
  }, [loggedInUserData, loggedInUserId, zoroEpId, gogoEpId, epNo]); //Adding zoro and gogo ids are not necessary, having said that its better to have this data as up to date as possible.

  useEffect(() => {
    //This useEffect triggers whenever the params for comments api changes that means whenever we want to get the comments data from the comments api.
    (async () => {
      setLoadingStates((prev) => ({ ...prev, loadMore: true }));
      const res = await debounceGetComments(params);
      if (Array.isArray(res) && res?.length < (params.limit || 10)) {
        //make sure that res is an array

        setLoadingStates((pr) => ({ ...pr, noMoreComments: true }));
      } //means that there are no more comments left to fetch in the database so hide the load more button
      setCommentsData((prev) => [...prev, ...res]);
      setLoadingStates((prev) => ({
        ...prev,
        loadMore: false,
        hasOnceLoaded: true,
      })); //disable load more loader
    })();

    // return () => {
    //   setLoadingStates(({loadMore:false, noMoreComments:false, hasOnceLoaded:false})); //reset the loading states}));
    // }
  }, [params.offset, params.limit]);

  //below will fetch the comments when new episode, anime, user or different ordering is selected
  useEffect(() => {
    (async () => {
      setParams((prev) => ({
        ...prev,
        offset: 0,
      }));
      const res = await debounceGetComments({ ...params, offset: 0 });
      setCommentsData(res);
      setLoadingStates((prev) => ({ ...prev, hasOnceLoaded: true }));
      if (Array.isArray(res) && res?.length < (params.limit || 10)) {
        setLoadingStates((prev) => ({ ...prev, noMoreComments: true }));
      }
      setLoadingStates((prev) => ({ ...prev, loadMore: false })); //disable load more loader
    })();

    return () => {
      setCommentsData([]); //clear the comments data when the params change
      setLoadingStates({
        loadMore: false,
        noMoreComments: false,
        hasOnceLoaded: false,
      }); //reset the loading states}));
    };
  }, [params.epNo, params.animeId, params.userId, params.orderBy]);


  // the sole purpose of this useEffect is to scroll to the comment which has the hash id in the url, this is done when the page loads or when the user clicks on a notification which has a comment id in it.
  useEffect(() => {
  if (hashCommentData && commentHashId) {
    setTimeout(() => {
      document.getElementById(`comment-${commentHashId}`)?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 200);
  }
}, [hashCommentData, commentHashId]);

  async function fetchCommentById() {
    if (loggedInUserId && commentHashId) {
      
      const res = await getCommentById(commentHashId, loggedInUserId);
      return res;
    }
    return null;
  }

  //? INFO ABOUT HOW THE COMMENTS API WORKS

  // basically uper 2 useEffects h comments load krne k liye, vo isiliye kyunki ek jiski dependency offset and limit h vo current comments k array m aur comments append krta hai, but jb hmko episode change krna ho ya filter lagana ho, ya fir user change krna ho tb hm append nahi krenge blki shru se fetch krenge comments data.

  //In useEffects m cleanup function bhi jaruri h kyunki uske bina jab bhi koi params change hoga to wo purane comments ko nahi hataega and naye comments ko append karega, so purane comments bhi dikhte rahenge jo ki nahi hona chahiye. So cleanup function m hum commentsData ko clear krte h and loading states ko reset krte h.

  //Ab isme ek loadingStates krke ek state h jo ki 3 cheeze store krta h, loadMore, noMoreComments and hasOnceLoaded.

  // ---> sbse pehle hasOnceLoaded ki agar baat kre to iska sirf itna kaam h ki ye batayega ki comments ek baar bhi fetch hue h ki nahi...agar hue h and comments data m kuch nahi h to fir first comment abhi tk nahi kiya h is episode pr so show anya, agar nahi hue yaani is state ki value false h yaani loading state dikhana h.

  //----> loadMore ki baat  kre to ye sirf ye cheez batata h ki kya load more button click krne k baad aur comments load ho rahe h ya nahi, agar ye true h yaani load ho rahe h vrna false. agar ye true h to blue chakka dikhega pr sirf tb jb hasOnceLoaded true hoga aur noMoreComments flag false hoga (yaani ab bhi comments exist krte h db m is anime episode k liye) warna nahi dikhega.

  //----> noMoreComments ki baat kre to ye sirf ye cheez batata h ki kya load more button click krne k baad aur koi comments nahi aaye yaani abhi tk jitne comments the wo sab aa gaye h, so isse hum load more button ko hide kar sakte h.

  const handleLoadMore = () => {
    setLoadingStates((prev) => ({ ...prev, loadMore: true })); //enable load more loader
    setParams((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  return (
    <div className="comments-container flex flex-col gap-4 md:mx-8 mx-2">
      <h1 className="text-primary-300 text-2xl px-2 font-semibold tracking-wide">
        Comments
      </h1>
      <div className="comments flex md:text-sm  rounded-xl px-2 justify-center md:justify-normal md:px-6 py-4 bg-cbg-300/60 flex-col gap-4  min-h-48">
        {loggedInUserId && (
          <div className="post-comment flex flex-col gap-2">
            <div className="user-id flex gap-2 items-center">
              <div className="relative rounded-full overflow-hidden object-cover object-center h-10 w-10">
                <Image
                  src={loggedInUserData?.photoUrl || ""}
                  alt={loggedInUserData?.userName}
                  fill
                />
              </div>
              <div className="label">
                Comment as{" "}
                <b className="text-primary-400 font-normal">
                  {loggedInUserData?.userName}
                </b>
              </div>
            </div>
          </div>
        )}

        {/* //below is the div of adding the commment */}

        <InputCommentDiv
          commentPayload={commentPayload}
          setCommentPayload={setCommentPayload}
        />
        {/* </div>  div for adding the comment ended here  */}

        {/* //div for list of comments begins here */}
        <div className="md:w-3/5 w-full flex flex-col gap-6 mt-8">
          {/* {console.log('comments --------', commentsData)} */}
          {loadingStates.hasOnceLoaded ? (
            commentsData && commentsData?.length > 0 ? (
              <>
                {hashCommentData && (
                  <CommentCard
                    key={hashCommentData.commentId}
                    id={hashCommentData.commentId}
                    highlighted={true}
                    animeId={animeId}
                    loggedInUserData={loggedInUserData}
                    comment={hashCommentData}
                    userId={loggedInUserId}
                  />
                )}
                {commentsData?.map((comment) => {
                  return (
                    String(comment.commentId) !== String(commentHashId) && (
                      <CommentCard
                        key={comment.commentId}
                        id={comment.commentId}
                        highlighted={false}
                        animeId={animeId}
                        loggedInUserData={loggedInUserData}
                        comment={comment}
                        userId={loggedInUserId}
                      />
                    )
                  );
                })}
              </>
            ) : (
              <div className="no comments flex-col gap-8 mx-auto items-center justify-center">
                <div className="img relative flex self-center h-32 w-36 mx-auto rounded-md my-4 overflow-hidden ">
                  <Image
                    src="/waku-waku-anya.gif"
                    alt="No Comments Here"
                    unoptimized
                    fill
                  />
                </div>
                <h2 className="text-base text-sky-200">
                  Be the first to comment – Anya is waiting!
                </h2>
              </div>
            )
          ) : (
            <div>
              <div className="img relative flex self-center h-36 w-48 mx-auto rounded-md my-4 overflow-hidden ">
                <Image
                  src="/comments loading.gif"
                  alt="Comments Loading"
                  unoptimized
                  fill
                />
              </div>
            </div>
          )}
        </div>

        {loadingStates.hasOnceLoaded &&
          !loadingStates.noMoreComments &&
          (!loadingStates?.loadMore ? (
            <button
              className="text-base text-primary-200 font-semibold tracking-wide flex w-fit mx-4"
              onClick={() => handleLoadMore()}
            >
              Load more
            </button>
          ) : (
            <div className="flex m-8 mx-12">
              <TailSpin
                visible={loadingStates.loadMore}
                height="32"
                width="32"
                color=" #0ea5e9"
                ariaLabel="tail-spin-loading"
                radius="2"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
          ))}
      </div>
    </div>
  );
}
