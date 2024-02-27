import React from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import data from "/public/anime_list.js";

const Searchanime = () => {
  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
  };
  // data && console.log(data)
  const handleOnHover = (result) => {
    // the item hovered
  };

  const handleOnSelect = (item) => {};

  const handleOnFocus = () => {
    // console.log('Focused')
  };

  const formatResult = (item) => {
    return (
      <>
        <span style={{ display: "block", textAlign: "left" }}>
          {item.English}&nbsp;({item.Type})
        </span>
        {item.Premiered !== "Unknown" && (
          <span style={{ display: "block", textAlign: "left" }}>
            Premiered in : {item.Premiered}
          </span>
        )}
      </>
    );
  };

  return (
    <div className="search">
      <header className="App-header">
        <div
          style={{ width: 900, borderRadius: "10px", margin: "1rem 1.5rem" }}
        >
          <ReactSearchAutocomplete
            styling={{
              borderRadius: "5px solid white",
              fontSize: "1.3em",
              zIndex: "3",
              border: "none",
              filter: "alpha(opacity=60)",
              backgroundColor: "#121212",
              hoverBackgroundColor: " #322f34  ",
              color: "whitesmoke",
              height: "3rem",
            }}
            items={data}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            autoFocus
            placeholder="Search Anime..."
            // maxResults={8}
            resultStringKeyName="English"
            fuseOptions={{ keys: ["English"] }}
            formatResult={formatResult}
          />
        </div>
      </header>
    </div>
  );
};

export default Searchanime;
