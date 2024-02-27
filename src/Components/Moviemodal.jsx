import React from "react";
import {
  Modal,
  Text,
  Row,
  Container,
  Col,
  Input,
  Button,
  Badge,
} from "@nextui-org/react";
import Image from "next/image";
import styles from "../styles/Moviemodal.module.css";
import { FaRegStar, FaStar } from "react-icons/fa";
import Rating from "react-rating";

const Moviemodal = ({ detail }) => {
  //     const externaImageLoader = ({ src }: { src: String }) =>
  // `https://image.tmdb.org/t/p/original${src}`;

  // module.exports = {
  //     images: {
  //       domains: ['https://image.tmdb.org/t/p/original'],
  //     },
  //   };

  module.exports = {
    reactStrictMode: true,
    images: {
      loader: "default",
      minimumCacheTTL: 60,
      domains: ["https://image.tmdb.org/t/p/original"],
    },
  };

  return (
    <div className={styles.contain}>
      <div className={styles.image}>
        <Image
          src={`https://image.tmdb.org/t/p/w300${detail.poster_path}`}
          responsive
          css={{ borderRadius: "15px" }}
          width={350}
          height={450}
          alt="Movie"
          unoptimized={true}
        />
      </div>

      <div className={styles.contentM}>
        <Text
          css={{
            marginRight: "1rem",
            marginBottom: "0rem",
            padding: "0rem",
            fontWeight: "600",
            wordWrap: "break-word",
          }}
          color="white"
          b
          size={40}
          className={styles.title}
        >
          {detail.title}
        </Text>
        <Text
          css={{
            padding: "0rem",
            fontSize: "16px",
            color: "#86888D",
            marginBottom: "0.5rem",
          }}
          className={styles.rating}
        >
          {detail.tagline}
        </Text>

        <div
          style={{ display: "flex", marginBottom: "0.5rem" }}
          className={styles.rating}
        >
          <p
            style={{
              display: "flex",
              marginRight: "1rem",
              fontSize: "1.75rem",
              alignSelf: "center",
              fontWeight: "500",
              lineHeight: "2.5rem",
            }}
          >
            {Math.round((detail.vote_average / 2) * 10) / 10}
          </p>
          <div style={{ alignSelf: "center", marginTop: "0.1rem" }}>
            <Rating
              initialRating={detail.vote_average / 2}
              emptySymbol={<FaRegStar />}
              fullSymbol={<FaStar />}
              readonly
            />
          </div>
        </div>

        <div className={styles.lY}>
          <div className={styles.car}>
            <div className={styles.head}>Runtime</div>{" "}
            <div className={styles.bod}>{detail.runtime} min</div>
          </div>

          <div className={styles.car}>
            <div className={styles.head}>Aired</div>
            <div className={styles.bod}>{detail.release_date}</div>
          </div>
          <div className={styles.car}>
            <div className={styles.head}>Status</div>
            <div className={styles.bod}>{detail.status}</div>
          </div>
          <div className={styles.car}>
            <div className={styles.head}>Language</div>
            <div className={styles.bod}>{detail.original_language}</div>
          </div>
        </div>
        <div className={styles.last}>
          <div className={styles.genre}>Genre</div>
          <div style={{ marginBottom: "24px" }}>
            {detail.genres.split("-").map((gen, i) => {
              if (gen !== "Unknown")
                return (
                  <Badge
                    key={i}
                    size="md"
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
          </div>

          <div className={styles.genre}>Synopsis</div>

          <div className={styles.scroll}>{detail.overview}</div>

          <div style={{ marginBottom: "24px" }}>
            {detail.production_companies && <div>Studios</div>}
            {detail.production_companies &&
              detail.production_companies.split("-").map((gen, i) => {
                if (gen !== "Unknown")
                  return (
                    <Badge
                      key={i}
                      size="md"
                      isSquared
                      css={{
                        color: "black",
                        backgroundColor: "white",
                        margin: "0.1rem 0.2rem 0.1rem 0",
                      }}
                    >
                      {gen}
                    </Badge>
                  );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moviemodal;
