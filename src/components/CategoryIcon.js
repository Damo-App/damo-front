import React from "react";
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback } from "react-native";

const images = {
    Books: require("../../assets/images/category/Books.png"),
    Music: require("../../assets/images/category/Music.png"),
    Sports: require("../../assets/images/category/Sports.png"),
    Car: require("../../assets/images/category/Car.png"),
    Cook: require("../../assets/images/category/Cook.png"),
    Dance: require("../../assets/images/category/Dance.png"),
    Game: require("../../assets/images/category/Game.png"),
    Languages: require("../../assets/images/category/Languages.png"),
    MusicInstrument: require("../../assets/images/category/MusicInstrument.png"),
    Pets: require("../../assets/images/category/Pets.png"),
    Photo: require("../../assets/images/category/Photo.png"),
    Society: require("../../assets/images/category/Society.png"),
    Travel: require("../../assets/images/category/Travel.png"),
  };
  export const CategoryIcon = ({ imageName, onPress, style }) => {
    return (
      // <TouchableOpacity style={[style.container, style]} onPress={onPress}>
      //   <Image source={images[imageName]} style={style.image} />
      // </TouchableOpacity>

      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[style.container, style]} >
          <Image source={images[imageName]} style={style.image} />
        </View>
      </TouchableWithoutFeedback>

    );
  };