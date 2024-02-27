import React, { useState } from "react";
import Image from "next/image";
import { useFirebase } from "@/context/firebaseContext";
import { useRouter } from "next/router";
import { Dropdown, Tooltip } from "@nextui-org/react";
import { PiHeartStraightBold, PiHeartStraightFill } from "react-icons/pi";
import styles from "@/styles/Profile.module.css";
import Link from "next/link";


const Profilecard = ({ details, badge }) => {
  const { id, imageUrl, title, type, type2, synopsis } = details;
  const { updateUserLists } = useFirebase();
  const [selected, setSelected] = useState(
    new Set([badge === "favorite" ? "Status" : badge])
  );
  const [favourite, setFavourite] = useState(badge === "favorite");
  const [isChanging, setIsChanging] = useState(false);
  const mapVal = {
    Watching: "watching",
    Completed: "completed",
    "On Hold": "onHold",
    Dropped: "dropped",
    "Plan To Watch": "plan",
    "Plan To Read": "plan",
    Reading: "watching",
  };

  const selectedValue = React.useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );

  const updateFavourite = async () => {
    const i = type2 === "Manga" ? "manga_id" : "id";
    const j = type2 === "Manga" ? "chapters" : "episodes";
    const jval = type2 === "Manga" ? details.chapters : details.episodes;
    const main_picture = imageUrl;
    const title_english = title;
    const detA = {
      [i]: id,
      main_picture,
      title_english,
      [j]: jval,
      synopsis,
      type,
    };
    if (favourite) {
      // console.log("Hare Krishna", detA, type2==="Anime")
      setFavourite(false);
      await updateUserLists(detA, null, "favourites", type2 === "Anime");
    } else {
      await updateUserLists(detA, "favourites", null, type2 === "Anime");
      setFavourite(true);
    }
  };

  const updateList = async (key) => {
    const i = type2 === "Manga" ? "manga_id" : "id";
    const j = type2 === "Manga" ? "chapters" : "episodes";
    const jval = type2 === "Manga" ? details.chapters : details.episodes;
    const main_picture = imageUrl;
    const title_english = title;
    const detA = {
      [i]: id,
      main_picture,
      title_english,
      [j]: jval,
      synopsis,
      type,
    };
    setIsChanging(true);
    await updateUserLists(
      detA,
      mapVal[key],
      mapVal[selectedValue] === undefined ? null : mapVal[selectedValue],
      type2 === "Anime"
    );
    setIsChanging(false);
  };

  //* DETAILS THAT WE ARE GETTING FROM THE PARENT COMPONENT
  // console.log(details)
  const router = useRouter();
  // const reRoute = () => {
  //   router.push(
      
  //   );
  // };

  return (
    
    <article className={styles.card}>
      <Link legacyBehavior href={type2 === "Manga" ? `/MangaSeries/${id}` : `/AnimeSeries/${id}`} passHref>
      <a target="_blank" rel="noopener noreferrer">
      <div className={styles.temporary_text} >
        <Image
          src={imageUrl}
          fill
          alt="Anime/Manga Image"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
      </div>
      </a>
      </Link>
      
      <div className={styles.card_content}>
        <p className={styles.card_title}>
          {title.substr(0, 35) + (title.length > 35 ? "..." : "")}{" "}
        </p>
        <span className={styles.card_subtitle}>
          <ul>
            <li>{type2}</li>
            <li>
              {type2 === "Manga"
                ? `chapters : ${details.chapters}`
                : `episodes : ${details.episodes}`}{" "}
            </li>
          </ul>
        </span>
        <div className={styles.card_description}>
          <p className={styles.synopsis}>
            {(synopsis?synopsis:"NA").substr(0, 70) + (synopsis.length > 70 ? "..." : "")}
          </p>{" "}
          <br></br>
          <div className={styles.under_synopsis}>
            {badge === "favorite" &&
              (favourite ? (
                <Tooltip
                  content={"Remove from Favorites"}
                  rounded
                  color="secondary"
                >
                  <PiHeartStraightFill
                    size={30}
                    color="#c9000091"
                    onClick={() => updateFavourite()}
                  />
                </Tooltip>
              ) : (
                <Tooltip content={"Add to Favorites"} rounded color="secondary">
                  <PiHeartStraightBold
                    size={30}
                    color="#c9000091"
                    onClick={() => updateFavourite()}
                  />
                </Tooltip>
              ))}
            {badge !== "favorite" && (
              <Dropdown isDisabled={isChanging}>
                <Dropdown.Button
                  flat
                  color="secondary"
                  css={{
                    tt: "capitalize",
                    borderRadius: "35px",
                    height: "32px",
                  }}
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
                  <Dropdown.Item
                    key={type2 === "Manga" ? "Reading" : "Watching"}
                  >
                    {type2 === "Manga" ? "Reading" : "Watching"}
                  </Dropdown.Item>
                  <Dropdown.Item key="Dropped">Dropped</Dropdown.Item>
                  <Dropdown.Item
                    key={type2 === "Manga" ? "Plan To Read" : "Plan To Watch"}
                  >
                    Plan to {type2 === "Manga" ? "Read" : "Watch"}
                  </Dropdown.Item>
                  <Dropdown.Item key="On Hold">On Hold</Dropdown.Item>
                  <Dropdown.Item key="Completed">Completed</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default Profilecard;
