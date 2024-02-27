import React from "react";
import Mangaresultcard from "./Mangaresultcard";
import { Text } from "@nextui-org/react";

const Recommendations = ({ results, name }) => {
  // console.log(results,name);

  return (
    <div
      style={{ minHeight: "200px", display: "flex", flexDirection: "column" }}
    >
      <Text size={30} style={{ marginLeft: "4rem", fontFamily: "bold" }}>
        Animes Similar to: {name}
      </Text>

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexWrap: "wrap",
          alignSelf: "center",
          justifySelf: "center",
          width: "90vw",
        }}
      >
        {results &&
          results.map((result, i) => {
            return <Mangaresultcard key={i} detail={result} />;
          })}
      </div>
    </div>
  );
};

export default Recommendations;
