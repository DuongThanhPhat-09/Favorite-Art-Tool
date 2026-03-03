import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favsString = await AsyncStorage.getItem("favorites");
        if (favsString !== null) {
          setFavorites(JSON.parse(favsString));
        }
      } catch (e) {
        console.error("Lỗi khi tải danh sách yêu thích.", e);
      }
    };
    loadFavorites();
  }, []);

  const saveFavorites = async (newFavorites) => {
    try {
      const favsString = JSON.stringify(newFavorites);
      await AsyncStorage.setItem("favorites", favsString);
      setFavorites(newFavorites);
    } catch (e) {
      console.error("Lỗi khi lưu danh sách yêu thích.", e);
    }
  };

  const addFavorite = (artTool) => {
    if (!favorites.some((item) => item.id === artTool.id)) {
      const newFavorites = [...favorites, artTool];
      saveFavorites(newFavorites);
    }
  };

  const removeFavorite = (artToolId) => {
    const newFavorites = favorites.filter((item) => item.id !== artToolId);
    saveFavorites(newFavorites);
  };

  // ----- BẠN CẦN THÊM HÀM NÀY VÀO -----
  const clearFavorites = async () => {
    try {
      // 1. Xóa khỏi AsyncStorage
      await AsyncStorage.removeItem("favorites");
      // 2. Cập nhật state thành một mảng rỗng
      setFavorites([]);
    } catch (e) {
      console.error("Lỗi khi xóa tất cả danh sách yêu thích.", e);
    }
  };
  // ------------------------------------

  const isFavorite = (artToolId) => {
    return favorites.some((item) => item.id === artToolId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearFavorites, // <-- VÀ THÊM NÓ VÀO ĐÂY
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
