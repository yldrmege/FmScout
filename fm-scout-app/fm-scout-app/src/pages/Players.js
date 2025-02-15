import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Link import edin
import "./Players.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Players = () => {
  const [players, setPlayers] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [loading, setLoading] = useState(true); 
  const [favorites, setFavorites] = useState([]); 

  const [filters, setFilters] = useState({
    minAge: null,
    maxAge: null,
    clubName: "",
    leagueName: "",
    positionIds: [],
    minMarketValue: null,
    maxMarketValue: null,
    minPa: null,
    maxPa: null,
    minCa: null,
    maxCa: null,
    countryName: "",
  });

  const navigate = useNavigate();
  const playersPerPage = 30; 
  const paginationGroupSize = 10; 

  const taken = localStorage.getItem("userId");

  useEffect(() => {
    const cachedPlayers = sessionStorage.getItem("players");
    if (cachedPlayers) {
      setPlayers(JSON.parse(cachedPlayers));
      setLoading(false);
    } else {
      fetchPlayers(); 
    }
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/v1/football-players");
      const transformedData = response.data.map((player) => ({
        id: player.playerId,
        name: player.name,
        club: player.clubName,
        position: player.positions,
        salary: player.salary,
        ca: player.ca,
        pa: player.pa,
        age: player.age,
        clubId: player.clubId,
      }));
      sessionStorage.setItem("players", JSON.stringify(transformedData));
      setPlayers(transformedData);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredPlayers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            if (value.length > 0) params.append(key, value.join(","));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await axios.get(
        `http://localhost:8080/api/v1/football-players/filter?${params.toString()}`
      );

      const transformedData = response.data.map((player) => ({
        id: player.playerId,
        name: player.name,
        club: player.clubName,
        position: player.positions,
        salary: player.salary,
        ca: player.ca,
        pa: player.pa,
        age: player.age,
        clubId: player.clubId,
        leagueName: player.leagueName, // Add this field if needed
        countryName: player.countryName, // Add this field if needed
      }));

      setPlayers(transformedData);
    } catch (error) {
      console.error("Error fetching filtered players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handlePositionChange = (position) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      positionIds: prevFilters.positionIds.includes(position)
        ? prevFilters.positionIds.filter((pos) => pos !== position)
        : [...prevFilters.positionIds, position],
    }));
  };

  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);

  const handleAddToFavorites = async (player) => {
    if (taken === null) {
      navigate("/login"); 
      return;
    }

    try {
      const userId = Number(localStorage.getItem("userId")); 

      if (!favorites.some((fav) => fav.id === player.id)) {
        setFavorites([...favorites, player]);

        const response = await fetch(
          `http://localhost:8080/api/v1/favourites?userId=${userId}&playerId=${player.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          console.log("Favoriye ekleme başarılı!");
        } else {
          console.error("Favoriye ekleme hatası:", await response.text());
        }
      }
    } catch (error) {
      console.error("Favoriye eklerken bir hata oluştu:", error);
    }
  };

  const totalPages = Math.ceil(players.length / playersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const currentPaginationGroup = Math.floor((currentPage - 1) / paginationGroupSize);
  const startPage = currentPaginationGroup * paginationGroupSize + 1;
  const endPage = Math.min(startPage + paginationGroupSize - 1, totalPages);

  const goToPreviousGroup = () => {
    const previousGroupStart = startPage - paginationGroupSize;
    if (previousGroupStart > 0) {
      setCurrentPage(previousGroupStart);
    }
  };

  const goToNextGroup = () => {
    const nextGroupStart = startPage + paginationGroupSize;
    if (nextGroupStart <= totalPages) {
      setCurrentPage(nextGroupStart);
    }
  };

  if (loading) {
    return <div className="loading">Loading players...</div>;
  }

  return (
    <div className="players-page">
      <aside className="players-sidebar">
        <h2 style={{ color: "black" }}>Filters</h2>

        <div className="filter-group">
          <label htmlFor="minAge">Min Age</label>
          <input
            type="number"
            id="minAge"
            placeholder="Min Age"
            value={filters.minAge || ""}
            onChange={(e) => handleFilterChange("minAge", e.target.value)}
          />
        </div>
          
        <div className="filter-group">
          <label htmlFor="maxAge">Max Age</label>
          <input
            type="number"
            id="maxAge"
            placeholder="Max Age"
            value={filters.maxAge || ""}
            onChange={(e) => handleFilterChange("maxAge", e.target.value)}
          />
        </div>
          <div className="filter-group">
          <label htmlFor="clubName">Club Name</label>
          <input
            type="text"
            id="clubName"
            placeholder="Club Name"
            value={filters.clubName}
            onChange={(e) => handleFilterChange("clubName", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="leagueName">League Name</label>
          <input
            type="text"
            id="leagueName"
            placeholder="League Name"
            value={filters.leagueName}
            onChange={(e) => handleFilterChange("leagueName", e.target.value)}
          />
        </div>

        <div className="section-title"><strong>Position</strong></div>
        <div className="checkbox-group">
          {["GK", "DL", "DC", "DR", "WBL", "DMC", "WBR", "ML", "MC", "MR", "AML", "AMC", "AMR", "ST"].map((position, index) => (
            <label key={position}>
              <input
                type="checkbox"
                checked={filters.positionIds.includes(index + 1)}
                onChange={() => handlePositionChange(index + 1)}
              />
              {position}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <label htmlFor="minMarketValue">Min Market Value</label>
          <input
            type="number"
            id="minMarketValue"
            placeholder="Min Market Value"
            value={filters.minMarketValue}
            onChange={(e) => handleFilterChange("minMarketValue", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxMarketValue">Max Market Value</label>
          <input
            type="number"
            id="maxMarketValue"
            placeholder="Max Market Value"
            value={filters.maxMarketValue}
            onChange={(e) => handleFilterChange("maxMarketValue", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="minPa">Min PA</label>
          <input
            type="number"
            id="minPa"
            placeholder="Min PA"
            value={filters.minPa}
            onChange={(e) => handleFilterChange("minPa", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxPa">Max PA</label>
          <input
            type="number"
            id="maxPa"
            placeholder="Max PA"
            value={filters.maxPa}
            onChange={(e) => handleFilterChange("maxPa", e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="minCa">Min CA</label>
          <input
            type="number"
            id="minCa"
            placeholder="Min CA"
            value={filters.minCa || ""}
            onChange={(e) => handleFilterChange("minCa", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxCa">Max CA</label>
          <input
            type="number"
            id="maxCa"
            placeholder="Max CA"
            value={filters.maxCa || ""}
            onChange={(e) => handleFilterChange("maxCa", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="countryName">Country Name</label>
          <input
            type="text"
            id="countryName"
            placeholder="Country Name"
            value={filters.countryName || ""}
            onChange={(e) => handleFilterChange("countryName", e.target.value)}
          />
        </div>

        <button onClick={fetchFilteredPlayers} className="apply-filters-btn">Apply Filters</button>
      </aside>

      <main className="players-list">
        <h1>Players</h1>
        <table>
          <thead>
            <tr>
              <th>Add Favourites</th>
              <th>Name</th>
              <th>Club</th>
              <th>Position</th>
              <th>Salary</th>
              <th>CA</th>
              <th>PA</th>
              <th>Age</th>
            </tr>
          </thead>

          <tbody>
            {currentPlayers.map((player) => (
              <tr key={player.id}>
                <td>
                  <button
                    className="favorite-btn"
                    onClick={() => handleAddToFavorites(player)}
                  >
                    ⭐
                  </button>
                </td>
                <td>
                  <Link to={`/players/${player.id}`} className="player-link">
                    {player.name}
                  </Link>
                </td>
                <td>
                  {player.clubId ? (
                    <Link to={`/clubs/${player.clubId}`} className="club-link">
                      {player.club}
                    </Link>
                  ) : (
                    <span>No Club</span>
                  )}
                </td>
                <td>{Array.isArray(player.position) ? player.position.join(", ") : player.position}</td>
                <td>{player.salary}€</td>
                <td>{player.ca}</td>
                <td>{player.pa}</td>
                <td>{player.age}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={goToPreviousGroup}
            disabled={currentPage <= paginationGroupSize}
          >
            &lt;&lt;
          </button>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
            const pageNumber = startPage + i;
            return (
              <button
                key={pageNumber}
                className={`pagination-btn ${currentPage === pageNumber ? "active" : ""}`}
                onClick={() => paginate(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            className="pagination-btn"
            onClick={goToNextGroup}
            disabled={startPage + paginationGroupSize > totalPages}
          >
            &gt;&gt;
          </button>
        </div>
      </main>
    </div>
  );
};

export default Players;









