import React, { useState } from "react";
import { useFirebase } from "@/context/firebaseContext";
import { Textarea, Button, Loading } from "@nextui-org/react";
import styles from "../../styles/CommentForm.module.css";
import { IoSend } from "react-icons/io5";

const CommentForm = ({
  commentId,
  animeId,
  setOpenReplies,
  setOpenBox,
  placeholder,
}) => {
  const [text, setText] = useState("");
  const { addComment, getCommentsAgain, setGetCommentsAgain, signIn, checkUserCookies } =
    useFirebase();
  const [textStatus, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = React.useRef(null);

  const postComment = async () => {
    if (text.trim() === "") {
      setStatus(true);
      return false;
    }
    
    setLoading(true);
    
    const res = await addComment(text, animeId, commentId);

    if (res) {
      setLoading(false);
      setOpenBox && setOpenBox(false);
      setOpenReplies && setOpenReplies(true);

      setGetCommentsAgain(!getCommentsAgain);
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      setText("");
    } else {
      signIn();
    }
  };

  return (
    <div className={styles.main}>
      <Textarea
         ref={textareaRef}
         onChange={(e) => {
          setText(e.target.value);
          e.target.value != "" ? setStatus(false) : setStatus(true);
        }}
        placeholder={[placeholder]}
        maxRows={4}
        status={textStatus ? "error" : "default"}
        helperColor={textStatus ? "error" : "default"}
        helperText={textStatus ? "Can't be empty" : ""}
      />
      <Button
        disabled={loading}
        onClick={postComment}
        auto
        icon={<IoSend />}
        color={"#202121"}
      >
        {loading ? (
          <Loading type="points" color="currentColor" size="sm" />
        ) : (
          <>Post</>
        )}
      </Button>
    </div>
  );
};

export default CommentForm;
