import React from "react";
import { Avatar } from "@nextui-org/react";
import styles from "../../styles/CommentDesign.module.css";
import ReactTimeAgo from "react-time-ago";

const CommentDesign = ({ comment, animeId }) => {
  // const {getOthersData}=useFirebase();
  // const [user,setUser]=useState(null);

  // console.log(comment);

  // useEffect(()=>{
  //  getOthersData(comment.userRef).then((data)=>{
  //   setUser(data);
  //   //console.log(data);
  //  })
  // },[])

  return (
    // <>{user && (
    // <>
    // <div>{user.username}</div>
    // <div>{comment.text}</div>
    // </>
    // )}
    // </>
    <div className={styles.main}>
      <div className={styles.image}>
        <Avatar color="secondary" size="md" src={comment.userPhoto} />
      </div>
      <div className={styles.commentBody}>
        <div className={styles.titleHead}>
          <div className={styles.title}>{comment.userName}</div>
          <div className={styles.timeAgo}>
            <ReactTimeAgo
              date={
                new Date(
                  comment.commentedOn.seconds * 1000 +
                    comment.commentedOn.nanoseconds / 1000000
                )
              }
              locale="en-US"
            />
          </div>
        </div>
        <div className={styles.text}>{comment.text}</div>
      </div>
    </div>
  );
};

export default CommentDesign;
