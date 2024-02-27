import React, { useEffect, useState } from "react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

const CommentsSection = ({ id, comments }) => {
  const [root, setRoot] = useState();

  //console.log(comments);

  useEffect(() => {
    let rootData = null;

    if (comments != null)
      rootData = comments.filter((d) => d.data().parentId === null);
    setRoot(rootData);
  }, [comments]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "40vh",
        marginBottom: "5vh",
        marginTop: "5vh",
      }}
    >
      <div style={{ marginLeft: "1rem" }}>
        <CommentForm
          commentId={null}
          animeId={id}
          setOpenReplies={null}
          setOpenBox={null}
          placeholder={"Join the discussion..."}
        />
      </div>

      {root &&
        root.map((doc) => (
          <Comment
            key={doc.id}
            data={comments}
            currComment={doc}
            animeId={id}
          />
        ))}
    </div>
  );
};

export default CommentsSection;
