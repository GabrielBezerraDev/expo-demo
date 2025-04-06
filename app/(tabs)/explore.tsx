import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const DATA = [
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    title: "Pedidos mais feitos",
  },
];

type ItemProps = {
  item: any;
  onPress: () => void;
  style?: any;
};

const Item = ({ item, onPress, style }: ItemProps) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <div style={styles.item}>
      <Ionicons name="bar-chart-outline" size={32} />
      <Text style={styles.title}>{item.title}</Text>
    </div>
    <hr style={styles.hr}></hr>
  </TouchableOpacity>
);

export default function Orders() {
  const [selectedId, setSelectedId] = useState<string>();

  const renderItem = ({ item }: { item: any }) => {
    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.id)}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          style={styles.flatList}
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={selectedId}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: "#fff"
  },
  item: {
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    top: 2
  },
  flatList: {
    padding: 10,
  },
  hr: {
    width: "100%"
  }
});
