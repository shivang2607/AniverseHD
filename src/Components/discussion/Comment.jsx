import React, { useEffect, useState } from "react";
import CommentDesign from "./CommentDesign";
import CommentForm from "./CommentForm";
import styles from "../../styles/comment.module.css";
import { Button } from "@nextui-org/react";
import { BsReplyFill } from "react-icons/bs";

const Comment = ({ data, currComment, animeId }) => {
  const [replies, setReplies] = useState();
  const [openReplies, setOpenReplies] = useState(false);
  const [openBox, setOpenBox] = useState(false);

  useEffect(() => {
    let rep = null;
    if (data != null)
      rep = data.filter((d) => d.data().parentId === currComment.id);
    setReplies(rep);
  }, [data]);

  return (
    <div className={styles.main}>
      <div className={styles.commentContainer}>
        <div>
          <CommentDesign comment={currComment.data()} animeId={animeId} />
          <div className={styles.buttonContainer}>
            <Button
              size="xs"
              onClick={() => {
                setOpenReplies(!openReplies);
              }}
            >
              {openReplies ? <>Hide Replies</> : <>Show Replies</>}
            </Button>
               |
            <Button
              size="xs"
              icon={<BsReplyFill />}
              onClick={() => setOpenBox(!openBox)}
            >
              Reply
            </Button>
          </div>
        </div>
        {openBox && (
          <CommentForm
            commentId={currComment.id}
            animeId={animeId}
            setOpenReplies={setOpenReplies}
            setOpenBox={setOpenBox}
            placeholder={"Write a reply"}
          />
        )}
        <div className={styles.replies}>
          {openReplies && (
            <div className={styles.reply}>
              {replies.length > 0 ? (
                replies.map((d) => (
                  <CommentDesign
                    key={d.id}
                    comment={d.data()}
                    animeId={animeId}
                  />
                ))
              ) : (
                <>No Replies</>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
