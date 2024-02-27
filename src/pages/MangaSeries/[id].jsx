import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useFirebase } from "@/context/firebaseContext";
import axios from "axios";
import { Button, Loading } from "@nextui-org/react";
import CommentsSection from "@/Components/discussion/CommentsSection";
import styles from "../../styles/AnimeSeries.module.css";
import Recommendations from "@/Components/Mangarecommendations";
import Mangamodal from "@/Components/Mangamodal";

// const Mangamodal = dynamic(() => import("../../Components/Mangamodal"), {
//   ssr: false,
// });

const MangawithID = () => {
  const router = useRouter();
  const id = router.query.id;
  const [details, setDetails] = useState();
  const [tab, setTab] = useState(true);
  const { getComments, getCommentsAgain, getManga } = useFirebase();
  const [comments, setComments] = useState(null);
  const [status, setStatus] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const itemcount = 20;

  useEffect(() => {
    if(localStorage.getItem("M"+id)!==null){
     setDetails(JSON.parse(localStorage.getItem("M"+id)));
    }else{
    getManga(id).then((details) => {
      if (details === undefined) {
        setError(true);
      }else{

      localStorage.setItem("M"+id,JSON.stringify(details));
      setDetails(details);
    }
      // console.log(details);
    });}
  }, [id]);

  useEffect(() => {
    if (details) {
      //console.log("name: ",details.title_english?(details.title_english):(details.title))
      axios
        .post("https://animovixrecommendations.onrender.com/manga", {
          names: (details.title? details.title : details.title_english).replace(/:/g,''),
        })
        .then(function (response) {
          setLoading(false);
          setResults(response.data.slice(0, 48));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, [details]);

  useEffect(() => {
    getComments("m" + id).then((data) => {
      setComments(data.docs);
      setStatus(true);
    });
  }, [id, getCommentsAgain]);

  return (
    <div className={styles.main}>
      {details ? (
        <>
          <Mangamodal detail={details} />
          <div className={styles.second}>
            <div className={styles.tabs}>
              <Button
                size="sm"
                onClick={() => setTab(true)}
                color={tab ? "success" : "#808080"}
                className={styles.button}
              >
                {/* {tab && } */}
                Recommendations
              </Button>

              <Button
                size="sm"
                onClick={() => setTab(false)}
                color={!tab ? "success" : "#808080"}
                className={styles.button}
              >
                Discussion
              </Button>
            </div>

            {tab ? (
              <>
                {!loading ? (
                  // <div>heyyy</div>
                  <Recommendations
                    results={results}
                    name={details.title_english}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      justifyItems: "center",
                    }}
                  >
                    <Loading
                      color="secondary"
                      type="gradient"
                      loadingCss={{
                        $$loadingSize: "100px",
                        $$loadingBorder: "10px",
                        margin: "10vw auto",
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                {status && (
                  <CommentsSection id={"m" + id} comments={comments} />
                )}
              </>
            )}
          </div>
        </>
      ) : !error ? (
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
          }}
        >
          <Loading
            color="secondary"
            type="gradient"
            loadingCss={{
              $$loadingSize: "100px",
              $$loadingBorder: "10px",
              margin: "10vw auto",
            }}
          />
        </div>
      ) : (
        <center>
          <h1>Error 404: Page Not Found</h1>
        </center>
      )}
    </div>
  );
};

export default MangawithID;


