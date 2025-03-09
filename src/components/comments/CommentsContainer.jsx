import Image from "next/image";
import React, { useEffect, useState } from "react";
import { debounceGetComments } from "./utilFunctions";
import CommentCard from "./CommentCard";
import InputCommentDiv from "./InputCommentDIv";
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
    hasOnceLoaded:false,//this state has only one function, this tells wether the api has called even once otherwise before the first call on UI its shown that no comments are there.
    loadMore: false,
    noMoreComments: false, //not a loader, but a state which tells that all the comments available with the given paramters have been fetched from the database
  });

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
    isSpoiler: false,
    gogoEpId: gogoEpId,
    zoroEpId: zoroEpId,
  });

  useEffect(() => {
    (async () => {})();
  }, [loggedInUserId]);

  useEffect(() => {
    (async () => {
      setCommentPayload((prev) => ({
        ...prev,
        userId: loggedInUserId,
        zoroEpId,
        gogoEpId,
        epNo,
      }));

      //? For below code only loggedInUserId was needed as trigger but since we have implemented debounce function of 500ms delay this shouldn't cause any issue.
      if (!epNo) return;
      setParams((prev) => ({ ...prev, userId: loggedInUserId, epNo: epNo }));
    })();
  }, [loggedInUserId, zoroEpId, gogoEpId, epNo]); //Adding zoro and gogo ids are not necessary, having said that its better to have this data as up to date as possible.

  useEffect(() => {
    //This useEffect triggers whenever the params for comments api changes that means whenever we want to get the comments data from the comments api.
    (async () => {
      const res = await debounceGetComments(params);
      if (Array.isArray(res) && res?.length < (params.limit || 10)) {
        //make sure that res is an array
        console.log("insisde if statement");
        setLoadingStates((pr) => ({ ...pr, noMoreComments: true }));
      } //means that there are no more comments left to fetch in the database so hide the load more button
      setCommentsData((prev) => [...prev, ...res]);
      setLoadingStates((prev) => ({ ...prev, loadMore: false, hasOnceLoaded:true })); //disable load more loader
      
    })();
  }, [params]);

  const loadMore = () => {
    setLoadingStates((prev) => ({ ...prev, loadMore: true })); //enable load more loader
    setParams((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  return (
    <div className="comments-container justify-center flex flex-col gap-4 md:mx-8 mx-2">
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
          {loadingStates.hasOnceLoaded ? (commentsData && commentsData?.length > 0 ? (
            commentsData?.map((comment) => {
              return (
                <CommentCard
                  key={comment.commentId}
                  animeId={animeId}
                  comment={comment}
                  userId={loggedInUserId}
                />
              );
            })
          ) : (
            <div className="no comments flex-col gap-8 mx-auto items-center justify-center">
                <div className="img relative flex self-center h-32 w-36 mx-auto rounded-md my-4 overflow-hidden ">
                    <Image src = "/waku-waku-anya.gif" alt="No Comments Here"  fill/>
                </div>
                <h2 className="text-base text-sky-200">Be the first to comment – Anya is waiting!</h2>
            </div>
          )):
          <div>
            <div className="img relative flex self-center h-36 w-48 mx-auto rounded-md my-4 overflow-hidden ">
          <Image src = "/comments loading.gif" alt="Comments Loading"  fill/>
          </div>
      </div> }
        </div>

        {loadingStates.hasOnceLoaded && !loadingStates.noMoreComments &&
          (!loadingStates?.loadMore ? (
            <button
              className="text-base text-primary-200 font-semibold tracking-wide flex w-fit mx-4"
              onClick={() => loadMore()}
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
