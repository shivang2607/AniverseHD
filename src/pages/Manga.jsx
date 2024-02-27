import Head from "next/head";
import React, { useState, useEffect } from "react";
import { Button, Container, Pagination, Loading } from "@nextui-org/react";
import Image from "next/image";
import axios from "axios";
import data from "/public/manga_list";
import Moviecardquery from "@/Components/Moviecardquery";
import Movieresultcard from "@/Components/Movieresultcard";
import styles from "../styles/Search.module.css";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import Mangacardquery from "@/Components/Mangacardquery";
import Mangaresultcard from "@/Components/Mangaresultcard";

const Movies = () => {
  const [bars, setBars] = useState([{ value: "" }]);
  const [results, setResults] = useState([]);
  const [curpage, setCurpage] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ask, setAsk] = useState(false);
  const itemcount = 20;
  const poster_array = ["/kakashi.jpg"];
  const [big_img, setBig_img] = useState(
    poster_array[Math.floor(Math.random() * 1)]
  );
  //   console.log(big_img);

  useEffect(() => {
    // console.log(curpage);
    setResults(recommendations.slice((curpage - 1) * 20, 20 * curpage));
    axios.get("https://animovixrecommendations.onrender.com/");
    return () => {
      //   console.log("Cleanup function ");
    };
  }, [curpage, recommendations]);

  const handleOnSelect = (i, item) => {
    // console.log(i, item);
    setBars((s) => {
      const newArr = s.slice();
      newArr[i] = item;

      return newArr;
    });
    // console.log(bars)
  };

  const handleOnFocus = () => {
    // console.log('Focused')
  };
  const formatResult = (item) => {
    return (
      <>
        <Head>
          <title>🎬 Manga Recommendations</title>
          <meta
            name="description"
            content="Anime and Movies Recommendation system and can also be used for recommendations based on multiple anime or movies input. It is a static website and user can use this website to get recommendations for their next Anime to watch or next Movie to watch."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

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

  const addBar = () => {
    if (bars.length <= 3) {
      setBars((s) => {
        return [...s, { value: "" }];
      });
    } else window.alert("YOU HAVE REACHED THE MAXIMUM INPUT LIMIT !!");
  };

  const removeBar = () => {
    if (bars.length > 1)
      setBars((s) => {
        return s.slice(0, -1);
      });
    else {
      window.alert("AT LEAST 1 INPUT FIELD IS MANDATORY !!");
    }
  };

  const getRecommendations = () => {
    setCurpage(1);

    // console.log("query names", bars);
    var names = [];
    // if(bars.length===1 && !bars[0].English)window.alert("Please Select some Anime")
    for (var i = 0; i < bars.length; i++) {
      if (bars[i].title) names.push(bars[i].title);
    }

    var query = names.join("|");
    if (query.trim() === "") {
      window.alert("Please Select some Movie");
      setAsk(false);
    } else {
      setAsk(true);
      setLoading(true);
      //   console.log(query);
      axios
        .post("https://animovixrecommendations.onrender.com/manga", {
          names: query,
        })
        .then(function (response) {
          // console.log(response.data);
          setRecommendations(response.data);
          setLoading(false);
          setResults(response.data.slice(0, 20));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  return (
    <div
      className="container"
      style={{ height: "90vh", justifyContent: "center" }}
    >
      <div className={styles.contain}>
        <div className={`${styles.search} `}>
          {/* <Searchanime/> */}
          {bars.map((val, i) => {
            return (
              <Container
                key={i}
                style={{
                  width: "900",
                  borderRadius: "10px",
                  margin: "5.5rem 1.5rem",
                }}
                className="container"
              >
                <ReactSearchAutocomplete
                  styling={{
                    borderRadius: "5px solid white",
                    fontSize: "1.3em",
                    zIndex: `${8 - i}`,
                    border: "none",
                    filter: "alpha(opacity=60)",
                    backgroundColor: "#121212",
                    hoverBackgroundColor: " #322f34  ",
                    color: "whitesmoke",
                    height: "3rem",
                  }}
                  items={data}
                  value={val}
                  id={i}
                  onSelect={(item) => handleOnSelect(i, item)}
                  autoFocus
                  placeholder={`Search Manga ${i + 1}...`}
                  maxResults={4}
                  resultStringKeyName="title"
                  fuseOptions={{ keys: ["title"] }}
                  formatResult={formatResult}
                />
              </Container>
            );
          })}
          <div className={styles.btngrp}>
            <Button
              bordered
              className={styles.btn}
              color="gradient"
              auto
              onPress={addBar}
            >
              Add Manga
            </Button>

            <Button
              bordered
              className={styles.btn}
              color="error"
              auto
              onPress={removeBar}
            >
              Remove Manga
            </Button>
          </div>
          <Container>
            <Button
              bordered
              disabled={loading}
              className={styles.btn}
              color="primary"
              auto
              onPress={getRecommendations}
            >
              {loading ? (
                <Loading type="points" color="currentColor" size="sm" />
              ) : (
                `Show Recommendations`
              )}
            </Button>
          </Container>
        </div>
        <Image
          className={styles.img}
          src={big_img}
          css={{ position: "sticky", opacity: "0.9" }}
          width={500}
          height={700}
          alt="Movie"
        />
      </div>
      {ask && (
        <Container
          className={styles.recommendcon}
          fluid
          display="flex"
          justify="space-evenly"
        >
          {
            <Container fluid>
              <div className={styles.querycard}>
                <h4 className={styles.h3}>Recommendations matching with :</h4>
                <br />
                <div className={styles.queries}>
                  {bars.map((item, i) => {
                    return item.title && <Mangacardquery key={i} item={item} />;
                  })}
                </div>
              </div>
            </Container>
          }
          {!loading ? (
            <Container>
              <Pagination
                shadow
                bordered
                css={{ display: "flex", m: "2rem" }}
                color="secondary"
                total={Math.ceil(100 / itemcount)}
                page={curpage}
                initialPage={1}
                onChange={(page) => setCurpage(page)}
              />

              {/* {console.log(results)} */}
              <div className={styles.results}>
                {results &&
                  results.map((result, i) => {
                    return <Mangaresultcard key={i} detail={result} />;
                  })}
              </div>

              <Pagination
                bordered
                shadow
                css={{ display: "flex", m: "2rem" }}
                color="secondary"
                total={Math.ceil(100 / itemcount)}
                page={curpage}
                initialPage={1}
                onChange={(page) => setCurpage(page)}
              />
            </Container>
          ) : (
            <Loading
              color="secondary"
              type="gradient"
              loadingCss={{
                $$loadingSize: "100px",
                $$loadingBorder: "10px",
                margin: "10vw auto",
              }}
            />
          )}
        </Container>
      )}
    </div>
  );
};

export default Movies;

export async function getStaticProps() {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  axios.post("https://animovixrecommendations.onrender.com/manga", {
    names: "School Zone",
  });

  return {
    props: {},
  };
}
