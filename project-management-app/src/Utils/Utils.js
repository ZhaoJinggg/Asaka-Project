export const capitalizeEachWord = (str) => {
  const words = str.split(" ");
  const capitalizedStr = words.map(word => {
    if (word.length === 0) {
      return "";
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return capitalizedStr.join(" ");
}

export const removeHyphen = (str) => {
  return str.replace("-", " ");
}