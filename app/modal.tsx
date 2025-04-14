import { supabase } from "@/services/supabase";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Link } from "expo-router";
import { RefObject, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { BarChart } from "react-native-gifted-charts";
import Animated, {
  FadeIn,
  Keyframe,
  SlideInRight,
} from "react-native-reanimated";

async function getFoods(): Promise<any> {
  let formatData: any[] = [];
  let dataMenuColumns = new Map<string, any>();
  let response = (await supabase.from("Menu").select(`id, food`)) as any;
  let dataMenu: any = response.data;
  dataMenu.forEach((menu: any) => {
    dataMenuColumns.set(menu.food, {
      key: menu.id,
      frontColor: "#ff1900",
      gradientColor: "#48ff00",
      label: menu.food,
    });
  });
  // console.log(dataMenuColumns.entries());
  let { data, error } = (await supabase.from("Order").select(`
    Menu!food (id, food)
  `)) as any;
  // console.log(formatData);
  if (data) {
    let count: number = 0;
    for (let i = 0; i < data.length; i++) {
      if (
        formatData.some(
          (dataFormat: any) => dataFormat.key === data[i]["Menu"].id
        )
      )
        continue;
      for (let j = 0; j < data.length; j++) {
        if (data[i]["Menu"].id === data[j]["Menu"].id) {
          count++;
        }
        if (j === data.length - 1) {
          formatData.push({
            ...dataMenuColumns.get(data[i]["Menu"].food),
            value: count,
          });
          count = 0;
        }
      }
    }
    dataMenuColumns.keys().forEach((key: string) => {
      if (!formatData.some((object: any) => object.label === key)) {
        formatData.push({ ...dataMenuColumns.get(key), value: 0 });
      }
    });
    formatData.sort((a, b) => b.value - a.value);
  }
  return formatData.length > 0 ? createColumns(formatData) : [];
}

// function animationCharts<T>(ref: T | null) {

// }

function createColumns(formatData: any) {
  let columns: any = [];
  formatData.forEach((data: any) => {
    columns.push({ ...data });
  });
  return columns;
}

export default function ModalChart() {
  let teste = useRef<View>(null);
  let [loading, setLoading] = useState(false);
  let [dataFood, setDataFood] = useState<any>([]);
  let [maxY, setMaxY] = useState<any>();

  const loadData = async () => {
    const foods = await getFoods();
    setDataFood([...foods]);
    setMaxY(foods[0].value);
  };

  // animationCharts<View>(teste.current);



  useEffect(() => {
    const animationCharts = () => {
      if (teste.current) {
        setTimeout(() => {
          let teste2 = document.querySelectorAll(
            "div[tabIndex='0']"
          )[0] as unknown as HTMLElement;
          let bar = teste2.querySelectorAll("div[tabIndex='0']");
          let allBar: any = [];
          bar.forEach((div: Element) => {
            (div.firstElementChild as HTMLDivElement).style.height = "0px";
            allBar.push({
              min: div.firstElementChild,
              max: div.firstElementChild?.firstElementChild,
            });
          });
  
          setTimeout(() => {
            setLoading(true);
            allBar.forEach((div: any) => {
              div.min.style.transition = "height 2s";
              let style = getComputedStyle(div.max);
              div.min.style.height = `${style.height}`;
            });
          }, 100);
        }, 200);
      }
    };
    loadData();
    animationCharts();
  }, [teste]);

  return (
    <Animated.View
      entering={SlideInRight}
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffff",
        gap: 20,
      }}
    >
      {/* Dismiss modal when pressing outside */}
      <Link href={"/"} asChild>
        <Pressable style={StyleSheet.absoluteFill} />
      </Link>
      <View
        style={{
          width: "95%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          gap: 20,
          boxSizing: "border-box",
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          padding: 30,
        }}
      >
        {(() => {
          if (!loading) {
            return (
              <>
                <View ref={teste}>
                  <BarChart
                    renderTooltip={() => "teste"}
                    showValuesAsTopLabel={true}
                    showGradient={true}
                    minHeight={3}
                    initialSpacing={10}
                    maxValue={maxY}
                    noOfSections={2}
                    data={dataFood}
                    spacing={30}
                    isAnimated={true}
                    animationDuration={2000}
                  />
                </View>
                <SegmentedControl
                  tabStyle={{ padding: 10 }}
                  appearance={"light"}
                  onValueChange={(value) => console.log(value)}
                  values={["Anterior", "Próximo"]}
                ></SegmentedControl>
              </>
            );
          } else {
            return (
              <>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ fontWeight: "bold" }}>Carregando Gráfico</Text>
              </>
            );
          }
        })()}
      </View>
      {/* <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Modal Screen</Text> */}
      <Link href="/explore"></Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  teste: {},
});
