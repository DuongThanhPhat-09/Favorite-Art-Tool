import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Image,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../context/FavoritesContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const theme = {
  primary: "tomato",
  background: "#f5f5f5",
  card: "white",
  text: "#333",
  placeholder: "#888",
  success: "#28a745",
  info: "#17a2b8",
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ArtToolCard = React.memo(({ item, onFavoriteToggle, onNavigate }) => {
  const { isFavorite } = useFavorites();

  // --- START: LOGIC TÍNH GIÁ MỚI ---
  const hasDeal = item.limitedTimeDeal > 0;
  const originalPrice = parseFloat(item.price);
  const discountedPrice = hasDeal
    ? originalPrice * (1 - item.limitedTimeDeal)
    : originalPrice;
  // --- END: LOGIC TÍNH GIÁ MỚI ---

  return (
    <Pressable style={styles.card} onPress={() => onNavigate(item)}>
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
      <Pressable
        onPress={() => onFavoriteToggle(item)}
        style={styles.heartIcon}
      >
        <Ionicons
          name={isFavorite(item.id) ? "heart" : "heart-outline"}
          size={28}
          color={theme.primary}
        />
      </Pressable>
    </Pressable>
  );
});

const MOCKAPI_URL = "https://68f72bc4f7fb897c6614c212.mockapi.io/artTools";

const PRICE_FILTERS = [
  { key: "all", label: "All" },
  { key: "0-10", label: "$0 - $10" },
  { key: "10-50", label: "$10 - $50" },
  { key: "50+", label: "Over $50" },
];

const HomeScreen = () => {
  const [artTools, setArtTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const fetchArtTools = async () => {
      try {
        const response = await axios.get(MOCKAPI_URL);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setArtTools(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtTools();
  }, []);

  const processedData = useMemo(() => {
    let result = [...artTools];

    if (searchQuery) {
      result = result.filter((tool) =>
        tool.artName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // --- START: CẬP NHẬT LOGIC LỌC VỚI GIÁ GIẢM ---
    const getEffectivePrice = (tool) => {
      const price = parseFloat(tool.price);
      const deal = tool.limitedTimeDeal || 0;
      return price * (1 - deal);
    };

    switch (activeFilter) {
      case "0-10":
        result = result.filter((tool) => {
          const effectivePrice = getEffectivePrice(tool);
          return effectivePrice >= 0 && effectivePrice <= 10;
        });
        break;
      case "10-50":
        result = result.filter((tool) => {
          const effectivePrice = getEffectivePrice(tool);
          return effectivePrice > 10 && effectivePrice <= 50;
        });
        break;
      case "50+":
        result = result.filter((tool) => getEffectivePrice(tool) > 50);
        break;
      default:
        break;
    }
    // --- END: CẬP NHẬT LOGIC LỌC ---

    // --- START: CẬP NHẬT LOGIC SẮP XẾP VỚI GIÁ GIẢM ---
    if (sortOrder === "asc") {
      result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sortOrder === "desc") {
      result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    }
    // --- END: CẬP NHẬT LOGIC SẮP XẾP ---

    return result;
  }, [searchQuery, artTools, activeFilter, sortOrder]);

  const handleFavoriteToggle = (item) => {
    const isCurrentlyFavorite = isFavorite(item.id);
    if (isCurrentlyFavorite) {
      removeFavorite(item.id);
      Toast.show({ type: "info", text1: "Removed from Favorites" });
    } else {
      addFavorite(item);
      Toast.show({ type: "success", text1: "Added to Favorites! ✨" });
    }
  };

  const handleNavigate = (item) => {
    navigation.navigate("Detail", { artTool: item });
  };

  const renderEmptyComponent = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>No matching products found.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.placeholder}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for art tools..."
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter and Sort UI */}
      <View style={styles.controlsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterGroup}
        >
          {PRICE_FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.activeFilter,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by price:</Text>
        <View style={styles.sortGroup}>
          <Pressable
            style={styles.sortButton}
            onPress={() =>
              setSortOrder(sortOrder === "asc" ? "default" : "asc")
            }
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={30}
              color={sortOrder === "asc" ? theme.primary : theme.placeholder}
            />
          </Pressable>
          <Pressable
            style={styles.sortButton}
            onPress={() =>
              setSortOrder(sortOrder === "desc" ? "default" : "desc")
            }
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={30}
              color={sortOrder === "desc" ? theme.primary : theme.placeholder}
            />
          </Pressable>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={styles.centered}
        />
      ) : (
        <FlatList
          data={processedData}
          renderItem={({ item }) => (
            <ArtToolCard
              item={item}
              onFavoriteToggle={handleFavoriteToggle}
              onNavigate={handleNavigate}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: theme.background },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    alignItems: "center",
  },
  image: { width: "100%", height: 120, marginBottom: 10 },
  infoContainer: { width: "100%" },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    minHeight: 34,
    color: theme.text,
  },
  price: { fontSize: 16, color: theme.text, marginTop: 4 },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.primary,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: theme.placeholder,
    textDecorationLine: "line-through",
  },
  heartIcon: { position: "absolute", top: 10, right: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 16, color: theme.text },
  emptyText: { color: theme.placeholder, fontSize: 16 },
  controlsContainer: {
    paddingLeft: 15,
    paddingVertical: 10,
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterText: {
    color: theme.text,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sortLabel: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "500",
  },
  sortGroup: {
    flexDirection: "row",
  },
  sortButton: {
    padding: 5,
    marginLeft: 10,
  },
});

export default HomeScreen;
