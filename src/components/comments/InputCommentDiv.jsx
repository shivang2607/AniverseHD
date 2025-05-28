import React, { useState } from "react";
import { Comment } from "react-loader-spinner";
import { postComment, putComment } from "./utilFunctions";
import toast from "react-hot-toast";
import useGlobalLoader from "../ZustandStores/useGlobalLoader";
import useUserStore from "../ZustandStores/userStore";

const commentLength = 500;

export default function InputCommentDiv({
  commentPayload,
  setCommentPayload,
  isEdit = false,
  isReply = false,
  setIsEdit,
}) {

    const { login } = useUserStore(); //used for signing in pop up
    const { setLoaderText, setIsLoaderVisible,setImageUrl } = useGlobalLoader(); //used for signing in pop up


  const [loadingStates, setLoadingStates] = useState({
    addComment: false,
  });

  const handleOnChangeComment = (e) => {
    const body = e.target.value;
    if (body.length > 500) {
      toast.error(`Comment length cannot exceed ${commentLength} characters!`);
      return;
    }

    if (isEdit) {
      setCommentPayload((prev) => ({ ...prev, editableBody: body }));
      return;
    }
    setCommentPayload((prev) => ({ ...prev, commentBody: body }));
  };

  const handleEditComment = async () => {
    //set the add comment loader to true
    setLoadingStates({ ...loadingStates, addComment: true });

    await putComment(commentPayload);
    //set the add comment loader to false and reset the comment body and spoiler flag
    setLoadingStates({ ...loadingStates, addComment: false });
    setIsEdit(false);
    // setCommentPayload(prev => ({...prev, commentBody: "", isSpoiler: false}));
  };

  const handleAddComment = async () => {
    // if there is no user id then pop up the google  signin window
    if (!commentPayload.userId) {
        setIsLoaderVisible(true);
        setImageUrl(" /userProfileImage7.jpg")
        await login((status)=>{
          setLoaderText(status)
        });
    
        setIsLoaderVisible(false)
        setLoaderText(null)
        setImageUrl(null)
        return;
    }

    //set the add comment loader to true
    setLoadingStates({ ...loadingStates, addComment: true });
    console.log("This is comment payload => ", commentPayload);
    await postComment(commentPayload);
    //set the add comment loader to false and reset the comment body and spoiler flag
    setLoadingStates({ ...loadingStates, addComment: false });
    setCommentPayload((prev) => ({
      ...prev,
      commentBody: "",
      isSpoiler: false,
    }));
  };

  return (
    <>
      {/* //below is the div of adding the commment */}
      <div
        className={`addcomment flex  flex-col    ${
          isReply ? "ml-12 w-auto" : "w-full md:w-3/4"
        }  gap-2`}
      >
        <div className="textarea">
          <textarea
            name="add-comment"
            id=""
            value={
              isEdit
                ? commentPayload?.editableBody
                : commentPayload?.commentBody
            }
            disabled={loadingStates.addComment}
            onChange={handleOnChangeComment}
            placeholder={`Type your ${isReply ? "Reply" : "Comment"} here..`}
            className="w-full resize-none rounded-xl p-2 bg-cbg-100/40 focus:outline-none focus:border-2 border-primary-100 text-gray-300"
          />
        </div>
        <div className="buttons flex gap-4 text-gray-400 items-center ml-auto">
          <label className="flex cursor-pointer items-center gap-1 text-gray-400">
            <input
              type="checkbox"
              checked={commentPayload.isSpoiler}
              onChange={(e) =>
                setCommentPayload((prev) => ({
                  ...prev,
                  isSpoiler: e.target.checked,
                }))
              }
              className="w-3 h-3  rounded-full bg-cbg-400 accent-primary-100"
              id="spoiler-checkbox"
            />
            Spoiler?
          </label>

          {/* Add Comment Button */}
          {loadingStates.addComment ? (
            <Comment
              visible={true}
              ariaLabel="comment-loading"
              wrapperStyle={{}}
              wrapperClass="comment-wrapper h-8 flex"
              color="#fff"
              backgroundColor="#57a6a1"
            />
          ) : (
            <button
              type="button"
              className=" text-cbg-200 font-semibold bg-primary-100 px-2 py-1 rounded-md hover:bg-primary-200 transition"
              onClick={isEdit ? handleEditComment : handleAddComment}
            >
              {isReply ? "Post Reply" : "Post Comment"}
            </button>
          )}
        </div>{" "}
        {/*buttons div ends here*/}
      </div>{" "}
      {/* div for adding the comment ended here  */}
    </>
  );
}
