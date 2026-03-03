import React, { useLayoutEffect } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Image,
  SafeAreaView,
  Alert,
  View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { useFavorites } from "../context/FavoritesContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const FavoritesScreen = () => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const navigation = useNavigation();

  const handleDeleteAllConfirm = () => {
    Alert.alert(
      "Clear All Favorites",
      "Are you sure you want to remove all items from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          onPress: () => {
            clearFavorites();
            Toast.show({
              type: "info",
              text1: "Favorites Cleared",
              text2: "All items have been removed.",
              visibilityTime: 2000,
            });
          },
          style: "destructive",
        },
      ]
    );
  };

  useLayoutEffect(() => {
    if (favorites.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={handleDeleteAllConfirm}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="trash" size={24} color="red" />
          </Pressable>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: null,
      });
    }
  }, [navigation, favorites]);

  const handleDeleteConfirm = (item) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove "${item.artName}" from your favorites?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            removeFavorite(item.id);
            Toast.show({
              type: "info",
              text1: "Removed from Favorites",
              text2: `${item.artName} has been removed.`,
              visibilityTime: 2000,
            });
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderVisibleItem = ({ item }) => {
    // --- START: LOGIC TÍNH GIÁ MỚI ---
    const hasDeal = item.limitedTimeDeal > 0;
    const originalPrice = parseFloat(item.price);
    const discountedPrice = hasDeal
      ? originalPrice * (1 - item.limitedTimeDeal)
      : originalPrice;
    // --- END: LOGIC TÍNH GIÁ MỚI ---

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          navigation.navigate("HomeStack", {
            screen: "Detail",
            params: { artTool: item },
          })
        }
      >
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {item.artName}
          </Text>
          {/* --- START: HIỂN THỊ GIÁ CÓ ĐIỀU KIỆN --- */}
          <View style={styles.priceContainer}>
            {hasDeal ? (
              <>
                <Text style={styles.discountedPrice}>
                  ${discountedPrice.toFixed(2)}
                </Text>
                <Text style={styles.originalPrice}>
                  ${originalPrice.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text style={styles.price}>${originalPrice.toFixed(2)}</Text>
            )}
          </View>
          {/* --- END: HIỂN THỊ GIÁ CÓ ĐIỀU KIỆN --- */}
        </View>
      </Pressable>
    );
  };

  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <Pressable
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => handleDeleteConfirm(item)}
      >
        <Ionicons name="trash-bin" size={25} color="white" />
        <Text style={styles.backTextWhite}>Delete</Text>
      </Pressable>
    </View>
  );

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="heart-dislike-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>Your favorite list is empty.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SwipeListView
        data={favorites}
        renderItem={renderVisibleItem}
        renderHiddenItem={renderHiddenItem}
        keyExtractor={(item) => item.id.toString()}
        rightOpenValue={-90}
        previewRowKey={"0"}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        disableRightSwipe
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  emptyText: { marginTop: 15, fontSize: 18, fontWeight: "bold", color: "#555" },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 100,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    alignItems: "center",
  },
  image: { width: 80, height: 80, marginRight: 15, borderRadius: 4 },
  infoContainer: { flex: 1, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, color: "#888", marginTop: 5 },
  // --- START: THÊM CÁC STYLE MỚI CHO GIÁ ---
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  discountedPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "tomato",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "line-through",
  },
  // --- END: THÊM CÁC STYLE MỚI CHO GIÁ ---
  rowBack: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 90,
  },
  backRightBtnRight: {
    backgroundColor: "red",
    right: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  backTextWhite: {
    color: "#FFF",
  },
});

export default FavoritesScreen;
