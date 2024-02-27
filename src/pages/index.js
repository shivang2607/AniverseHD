import Head from "next/head";
import { useState, useEffect } from "react";
import axios from "axios";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { Loading } from "@nextui-org/react";
import Presscard from "@/Components/Presscard";

import data from "/public/anime_list";
import data2 from "/public/manga_list";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import Image from "next/image";
import { ImSearch } from "react-icons/im";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [tab, setTab] = useState(false);

  useEffect(() => {
    const stored_type = JSON.parse(localStorage.getItem("type"));
    //console.log(stored_type);
    stored_type !== null && setTab(stored_type);
  }, []);

  const [anime, setAnime] = useState(null);
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(true);
  const router = useRouter();

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
  };
  // data && console.log(data)
  const handleOnHover = (result) => {
    // the item hovered
  };
  const handleOnSelect = (item) => {
    if (tab) setAnime(item.id);
    else setManga(item.manga_id);
  };

  const handleOnFocus = () => {};

  const searchAnime = () => {
    if (anime === null) {
      window.alert("Please Select some Anime");
    } else {
      setLoading(false);
      router.push(`/AnimeSeries/${anime}`);
    }
  };
  const handleKeyDown = (e) => {
    // console.log("key pressed");
    if (e.key === "Enter") {
      tab ? searchAnime() : searchManga();
    }
  };
  const searchManga = () => {
    if (manga === null) {
      window.alert("Please Select some Manga");
    } else {
      setLoading(false);
      router.push(`/MangaSeries/${manga}`);
    }
  };

  const formatAnime = (item) => {
    return (
      <>
        <div css={{ display: "flex" }}>

        


          <span className="" style={{ display: "flex", textAlign: "left" }}>
            {item.English}&nbsp;({item.Type})
          </span>
          {item.Premiered !== "Unknown" && (
            <span style={{ display: "flex", textAlign: "left" }}>
              Premiered in : {item.Premiered}
            </span>
          )}
          {item.Image_link && (
            <span style={{ display: "flex", textAlign: "right" }}>
              <Image
                src={item.Image_link}
                css={{ position: "sticky" }}
                width={50}
                height={65}
                alt="N/A"
                quality={20}
                unoptimized={true}
              />
            </span>
          )}
        </div>
      </>
    );
  };

  const formatManga = (item) => {
    return (
      <>
        <div css={{ display: "flex" }}>
          <span style={{ display: "flex", textAlign: "left" }}>
            {item.title}&nbsp;
          </span>
          {item.start_date !== "Unknown" && (
            <span style={{ display: "flex", textAlign: "left" }}>
              Released in : {item.start_date?.substr(0, 4)}
            </span>
          )}
          <span style={{ display: "flex", textAlign: "right" }}>
            <Image
              src={item.main_picture}
              css={{ position: "sticky" }}
              width={50}
              height={65}
              alt="N/A"
              quality={10}
              unoptimized={true}
            />
          </span>
        </div>
      </>
    );
  };

  return (
    <>
      {loading ? (
        <>
          <Head>
          <link rel="shortcut icon" href="/surveycorps.svg" />
          
            <title> Animovix Recommendations</title>
            <meta
              name="description"
              content="Anime and Movies Recommendation system and can also be used for recommendations based on multiple anime or movies input. It is a static website and user can use this website to get recommendations for their next Anime to watch or next Movie to watch."
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>

          <div className={styles.main}>
            <div
              className="parcar"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div className={styles.carousal}>
                <div
                  style={{
                    display: "flex",
                    width: "85vw",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <div className={styles.tab}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={tab}
                          onChange={() => {
                            setTab(!tab);
                            localStorage.setItem("type", JSON.stringify(!tab));
                          }}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                    <div className={styles.searchbar} onKeyDown={handleKeyDown}>
                      <ReactSearchAutocomplete
                        styling={{
                          borderRadius: "5px solid white",
                          fontSize: "1.3em",
                          zIndex: `8`,
                          border: "none",
                          filter: "alpha(opacity=60)",
                          backgroundColor: "#121212",
                          hoverBackgroundColor: " #322f34  ",
                          color: "whitesmoke",
                          height: "3rem",
                          borderRadius: "20px",
                        }}
                        items={tab ? data : data2}
                        onSearch={handleOnSearch}
                        onHover={handleOnHover}
                        onSelect={(item) => handleOnSelect(item)}
                        onFocus={handleOnFocus}
                        autoFocus
                        placeholder={
                          tab ? `Search Anime...` : `Search Manga...`
                        }
                        maxResults={3}
                        resultStringKeyName={tab ? "English" : "title"}
                        fuseOptions={{ keys: tab ? ["English"] : ["title"] }}
                        formatResult={tab ? formatAnime : formatManga}
                      />
                    </div>

                    {/* <Link legacyBehavior href={`/AnimeSeries/${detail.ID}`} passHref>
            <a target="_blank" rel="noopener noreferrer"> */}
                    <div
                      className={styles.searchIcon}
                      onKeyDown={handleKeyDown}
                      onClick={tab ? searchAnime : searchManga}
                    >
                      <a style={{ color: "white" }}>
                        <ImSearch size={25} />
                      </a>
                    </div>
                    {/* </a>
        </Link> */}

                    <div className={styles.image}>
                      <Image
                        src={"https://aniwatchtv.to/images/anw-min.webp"}
                        width={520}
                        height={450}
                        alt="NA"
                      />
                    </div>
                  </div>

                  <Link
                    legacyBehavior
                    href={tab ? `/Anime` : `/Manga`}
                    passHref
                  >
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.bottombanner}
                    >
                      Try Recommendation system
                      <AiOutlineArrowRight
                        style={{ marginLeft: "0.5rem" }}
                        size={20}
                      />
                    </a>
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.presscards}>
              <div className={styles.blur2}>
                <Presscard
                  src="press_anime_2.webp"
                  content="Anime Recommendations"
                  link="Anime"
                />
                <Presscard
                  src="press_movies.jpeg"
                  content="Movies Recommendations"
                  link="Movies"
                />
              </div>
            </div>
          </div>
        </>
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
  );
}

export async function getStaticProps() {

  
  return {
    props: {  
    },
  }
}
