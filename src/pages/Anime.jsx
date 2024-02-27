import Head from "next/head";
import React, { useState, useEffect } from "react";
import { Button, Container, Pagination, Loading } from "@nextui-org/react";
import Image from "next/image";
import axios from "axios";
import data from "/public/anime_list";
import Animecardquery from "@/Components/Animecardquery";
import Animeresultcard from "@/Components/Animeresultcard";
import styles from "../styles/Search.module.css";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

const Anime = () => {
  const [bars, setBars] = useState([{ value: "" }]);
  const [results, setResults] = useState([]);
  const [curpage, setCurpage] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ask, setAsk] = useState(false);
  const itemcount = 20;

  useEffect(() => {
    //console.log(curpage);
    setResults(recommendations.slice((curpage - 1) * 20, 20 * curpage));
    axios.get("https://animovixrecommendations.onrender.com/");
    return () => {
      //console.log("Cleanup function ");
    };
  }, [curpage, recommendations]);

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
  };
  // data && console.log(data)
  const handleOnHover = (result) => {
    // the item hovered
  };

  const handleOnSelect = (i, item) => {
    //console.log(i, item);
    setBars((s) => {
      const newArr = s.slice();
      newArr[i] = item;

      return newArr;
    });
    // console.log(bars)
  };

  // const handleOnClear = (i)=>{
  //   setBars(bar=>{
  //     const res = [...bar].splice(i-1, 1);
  //     return res
  //   })
  // }

  const handleOnFocus = () => {
    // console.log('Focused')
  };
  const formatResult = (item) => {
    return (
      <>
        <Head>
          <title>🎬 Anime Recommendations</title>
          <meta
            name="description"
            content="Anime and Movies Recommendation system and can also be used for recommendations based on multiple anime or movies input. It is a static website and user can use this website to get recommendations for their next Anime to watch or next Movie to watch."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div css={{ display: "flex" }}>
          <span style={{ display: "flex", textAlign: "left" }}>
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

    //console.log("query names", bars);
    var names = [];
    // if(bars.length===1 && !bars[0].English)window.alert("Please Select some Anime")
    for (var i = 0; i < bars.length; i++) {
      if (bars[i].English) names.push(bars[i].English);
    }

    var query = names.join("|");
    if (query.trim() === "") {
      window.alert("Please Select some Anime");
      setAsk(false);
    } else {
      setAsk(true);
      setLoading(true);
      // console.log(query);
      axios
        .post("https://animovixrecommendations.onrender.com/anime", {
          names: query,
        })
        .then(function (response) {
          //console.log(response.data);
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
              <Container key={i} className={styles.reactsearch}>
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
                  onSearch={handleOnSearch}
                  onHover={handleOnHover}
                  onSelect={(item) => handleOnSelect(i, item)}
                  onFocus={handleOnFocus}
                  autoFocus
                  placeholder={`Search Anime ${i + 1}...`}
                  maxResults={4}
                  resultStringKeyName="English"
                  fuseOptions={{ keys: ["English"] }}
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
              Add Anime
            </Button>

            <Button
              bordered
              className={styles.btn}
              color="error"
              auto
              onPress={removeBar}
            >
              Remove Anime
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
              {/* Show Recommendations */}
            </Button>
          </Container>
        </div>
        <Image
          className={styles.img}
          src="/kakashi.jpg"
          css={{ position: "sticky" }}
          width={500}
          height={700}
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
                    return (
                      item.English && <Animecardquery key={i} item={item} />
                    );
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
                    return <Animeresultcard key={i} detail={result} />;
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

export default Anime;

export async function getStaticProps() {
  axios.post("https://animovixrecommendations.onrender.com/anime", {
    names: "one piece",
  });

  return {
    props: {},
  };
}
