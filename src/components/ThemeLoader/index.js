import React from 'react';

const ThemeLoader = ({ language = 'en', fileName = 'default' }) => {
  const themeName = `./themes/` + fileName + '_theme.css'
  //console.log("css file to load: "+ themeName)

  return [
    <link key="theme" rel="stylesheet" type="text/css" href={themeName} />,
    language === 'ko' ? <link key="lang" rel="stylesheet" type="text/css" href="./kr.css" /> : null
  ];
};

export default ThemeLoader;