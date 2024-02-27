import React, { useEffect, useState } from "react";
import { Text, Badge, Dropdown,Tooltip} from "@nextui-org/react";
import Image from "next/image";
import styles from "../styles/Animemodal.module.css";
import { useFirebase } from "@/context/firebaseContext";
import {PiHeartStraightBold, PiHeartStraightFill} from 'react-icons/pi'
import json5 from "json5";

const Mangamodal = ({ detail }) => {
  const [selected, setSelected] = useState(new Set(["Status"]));
  const [favourite, setFavourite] = useState(false);
  const [isChanging, setIsChanging]=useState(false);
  const { updateUserLists, checkUserCookies,updateLocalStorage } = useFirebase();

  //console.log(detail);

  const mapVal = {
    "Reading": "watching",
    "Completed": "completed",
    "On Hold": "onHold",
    "Dropped": "dropped",
    "Plan To Read": "plan",
  };

  const selectedValue = React.useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );
  var val = 0;
  var val2 = 0;

  const updateFavourite = async () => {
    if (favourite) {
      await updateUserLists(detail, null, "favourites", false);
      setFavourite(false);
    } else {
      await updateUserLists(detail, "favourites", null, false);
      setFavourite(true);
    }   
  };

  const updateList = async (key) => {
    setIsChanging(true);
    await updateUserLists(detail, mapVal[key], mapVal[selectedValue]===undefined?null:mapVal[selectedValue],false);
    setIsChanging(false);
  };

  const initalState =() =>{
    
    const List= JSON.parse(localStorage.getItem("userLists"));

      List.completed.find((e) => e.id === Number(detail.manga_id) && e.type2==="Manga") &&
        setSelected(new Set(["Completed"]));
      List.plan.find((e) => e.id ===Number(detail.manga_id) && e.type2==="Manga") &&
        setSelected(new Set(["Plan To Read"]));

      List.watching.find((e) => e.id === Number(detail.manga_id) && e.type2==="Manga") &&
        setSelected(new Set(["Reading"]));
      
      List.dropped.find((e) => e.id === Number(detail.manga_id) && e.type2==="Manga") &&
        setSelected(new Set(["Dropped"]));
      
      List.onHold.find((e) =>  e.id === Number(detail.manga_id) && e.type2==="Manga") &&
        setSelected(new Set(["On Hold"]));
      
      List.favourites.find((e) => e.id === Number(detail.manga_id) && e.type2==="Manga") && setFavourite(true);
  }

  useEffect(() => {
    // const List= JSON.parse(localStorage.getItem("userLists"));

    // if (checkUserCookies() && List) {
    //   initalState();
    // }else if(checkUserCookies()){
      updateLocalStorage().then(()=>{
        initalState();
        })
    // }
  }, []);

  return (
    <div className={styles.contain}>
      <div className={styles.image}>
        <Image
          css={{ borderRadius: "15px" }}
          src={detail.main_picture}
          unoptimized={true}
          width={350}
          height={470}
          alt="NA"
        />
      </div>

      <div className={styles.contentM}>
        <Text
          css={{
            marginRight: "1rem",
            width: "800px",
            marginTop: "2rem",
            marginBottom: "0rem",
            fontWeight: "600",
            wordWrap: "break-word",
          }}
          color="white"
          b
          size={40}
          className={styles.title}
        >
          {detail.title_english ? detail.title_english : detail.title}
        </Text>

        <div className={styles.badges}>
          {checkUserCookies() && (
            <div className={styles.fav} onClick={updateFavourite}>
              {favourite ?  (<Tooltip
                  content={"Remove from Favorites"}
                  rounded
                  color="secondary"
                >
                <PiHeartStraightFill color="#c90000ef" className={styles.fav} />
                </Tooltip>) : (
                   <Tooltip
                   content={"Add to Favorites"}
                   rounded
                   color="secondary"
                 >
                <PiHeartStraightBold color="#c90000ef" className={styles.fav} />
                </Tooltip>
              )}
            </div>
          )}
          {/* <Badge size="md" css={{  margin:"0.1rem 0.2rem 1.5rem 0", padding:"0.5rem 1rem 0.5rem 1rem"}} color="primary" variant="flat" className={styles.head2}>{detail.sfw}</Badge> */}

          {checkUserCookies() && (
            <Dropdown isDisabled={isChanging}>
              <Dropdown.Button
                flat
                color="secondary"
                css={{ tt: "capitalize", borderRadius: "35px", height: "32px" }}
              >
                {selectedValue}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label="Single selection actions"
                color="secondary"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selected}
                onSelectionChange={setSelected}
                onAction={(key) => updateList(key)}
              >
                <Dropdown.Item key="Reading">Reading</Dropdown.Item>
                <Dropdown.Item key="Dropped">Dropped</Dropdown.Item>
                <Dropdown.Item key="Plan To Read">Plan To Read</Dropdown.Item>
                <Dropdown.Item key="On Hold">On Hold</Dropdown.Item>
                <Dropdown.Item key="Completed">Completed</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        <div className={styles.lY}>
          <div className={styles.car}>
            <div className={styles.head}>Chapters</div>
            {detail.chapters ?detail.chapters:"NA"}
          </div>

          <div className={styles.car}>
            <div className={styles.head}>Released</div>
            <div className={styles.bod}>{detail.start_date? detail.start_date:"NA"}</div>
          </div>
          <div className={styles.car}>
            <div className={styles.head}>Status</div>
            <div className={styles.bod}>{detail.status?detail.status:"NA"}</div>
          </div>
          <div className={styles.car}>
            <div className={styles.head}>Type</div>
            <div className={styles.bod}>{detail.type?detail.type:"NA"}</div>
          </div>

          <div className={styles.car}>
            <div className={styles.head}>MAL Score</div>
            <div className={styles.bod}>{detail.score?detail.score:"NA"}</div>
          </div>
        </div>
        <div className={styles.last}>
          <div className={styles.genre}>Genre</div>
          <div style={{ marginBottom: "24px" }}>
            {json5.parse(detail.genres).map((gen, i) => {
              if (gen !== "Unknown" && val == 0)
                return (
                  <Badge
                    size="md"
                    key={i}
                    css={{
                      color: "white",
                      backgroundColor: "teal",
                      margin: "0.1rem 0.2rem 0.1rem 0",
                    }}
                    isSquared
                    color="secondary"
                    variant="flat"
                  >
                    {gen}
                  </Badge>
                );
            })}
            {json5.parse(detail.themes).map((gen, i) => {
              if (gen !== "Unknown" && val2 == 0)
                return (
                  <Badge
                    size="md"
                    key={i}
                    css={{
                      color: "white",
                      backgroundColor: "teal",
                      margin: "0.1rem 0.2rem 0.1rem 0",
                      padding: "6px 8px",
                    }}
                    isSquared
                    color="secondary"
                    variant="flat"
                  >
                    {gen}
                  </Badge>
                );
            })}
          </div>

          <div className={styles.genre}>Synopsis</div>
          {/* <div className="hidden" style={{height:"10vh", overflow:'hidden'}}> */}
          <div className={styles.scroll}>{detail.synopsis?detail.synopsis:"Not Available"}</div>
          {/* </div> */}

          {/* <div style={{marginBottom:"24px"}}>
              <div>Studios</div>
              { 
                        detail.studios.split(",").map((gen,i)=>{
                           if(gen!=="Unknown" && val==0) return <Badge size="md" key={i} isSquared css={{color:"black", backgroundColor:"white", margin:"0.1rem 0.2rem 0.1rem 0"}} >
                            {gen}
                          </Badge>
                                  
                        })
                        
                    }
                         
                      
                        
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default Mangamodal;
