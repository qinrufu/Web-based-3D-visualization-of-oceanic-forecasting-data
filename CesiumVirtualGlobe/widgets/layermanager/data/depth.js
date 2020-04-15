var SOUNDDEPTH = {
    depth: [3.999013, 7.998026, 11.99704, 15.99605, 19.99506, 23.99408, 27.99309, 31.9921, 35.99112, 39.99013, 43.98914, 47.98816, 51.98717, 55.98618, 59.9852, 63.98421, 67.98322, 71.98223, 75.98125, 79.98026, 83.97927, 87.97829, 91.97729, 95.97631, 99.97533, 103.9743, 107.9734, 111.9724, 115.9714, 119.9704, 123.9694, 127.9684, 131.9674, 135.9664, 139.9655, 143.9645, 147.9635, 151.9625, 155.9615, 159.9605, 163.9595, 167.9585, 171.9576, 175.9566, 179.9556, 183.9546, 187.9536, 191.9526, 195.9516, 199.9507, 203.9497, 207.9487, 211.9477, 215.9467, 219.9457, 223.9447, 227.9437, 231.9427, 235.9418, 239.9408, 243.9398, 247.9388, 251.9378, 255.9368, 259.9359, 263.9348, 267.9339, 271.9329, 275.9319, 279.9309, 283.9299, 287.9289, 291.9279, 295.927, 299.926, 303.925, 307.924, 311.923, 315.922, 319.921, 323.92, 327.9191, 331.9181, 335.9171, 339.9161, 343.9151, 347.9141, 351.9131, 355.9121, 359.9112, 363.9102, 367.9092, 371.9082, 375.9072, 379.9062, 383.9052, 387.9043, 391.9033, 395.9023, 399.9013, 403.9003, 407.8993, 411.8983, 415.8973, 419.8964, 423.8954, 427.8944, 431.8934, 435.8924, 439.8914, 443.8904, 447.8895, 451.8885, 455.8875, 459.8865, 463.8855, 467.8845, 471.8835, 475.8825, 479.8816, 483.8806, 487.8796, 491.8786, 495.8776, 499.8766, 503.8756, 507.8746, 511.8737, 515.8727, 519.8717, 523.8707, 527.8697, 531.8687, 535.8677, 539.8668, 543.8658, 547.8647, 551.8638, 555.8628, 559.8618, 563.8608, 567.8599, 571.8588, 575.8578, 579.8569, 583.8559, 587.8549, 591.8539, 595.8529, 599.8519, 603.851, 607.85, 611.849, 615.848, 619.847, 623.846, 627.845, 631.8441, 635.8431, 639.842, 643.8411, 647.8401, 651.8391, 655.8381, 659.8372, 663.8361, 667.8351, 671.8342, 675.8332, 679.8322, 683.8312, 687.8302, 691.8292, 695.8282, 699.8273, 703.8263, 707.8253, 711.8243, 715.8233, 719.8223, 723.8214, 727.8204, 731.8194, 735.8184, 739.8174, 743.8164, 747.8154, 751.8145, 755.8135, 759.8124, 763.8115, 767.8105, 771.8095, 775.8085, 779.8075, 783.8065, 787.8055, 791.8046, 795.8036, 799.8026, 803.8016, 807.8006, 811.7996, 815.7986, 819.7977, 823.7967, 827.7957, 831.7947, 835.7937, 839.7927, 843.7917, 847.7908, 851.7897, 855.7888, 859.7878, 863.7868, 867.7858, 871.7849, 875.7838, 879.7828, 883.7819, 887.7809, 891.7799, 895.7789, 899.7779, 903.7769, 907.7759, 911.775, 915.774, 919.7729, 923.772, 927.771, 931.77, 935.769, 939.7681, 943.767, 947.7661, 951.7651, 955.7641, 959.7631, 963.7621, 967.7611, 971.7601, 975.7592, 979.7582, 983.7572, 987.7562, 991.7552, 995.7542, 999.7532, 1003.752, 1007.751, 1011.75, 1015.749, 1019.748, 1023.747, 1027.746, 1031.745, 1035.744, 1039.743, 1043.742, 1047.741, 1051.74, 1055.739, 1059.738, 1063.737, 1067.736, 1071.735, 1075.734, 1079.734, 1083.733, 1087.732, 1091.731, 1095.729, 1099.729, 1103.728, 1107.727, 1111.726, 1115.725, 1119.724, 1123.723, 1127.722, 1131.721, 1135.72, 1139.719, 1143.718, 1147.717, 1151.716, 1155.715, 1159.714, 1163.713, 1167.712, 1171.711, 1175.71, 1179.709, 1183.708, 1187.707, 1191.706, 1195.705, 1199.704, 1203.703, 1207.702, 1211.701, 1215.7, 1219.699, 1223.698, 1227.697, 1231.696, 1235.695, 1239.694, 1243.693, 1247.692, 1251.691, 1255.69, 1259.689, 1263.688, 1267.687, 1271.686, 1275.685, 1279.684, 1283.683, 1287.682, 1291.681, 1295.68, 1299.679, 1303.678, 1307.677, 1311.676, 1315.675, 1319.674, 1323.673, 1327.672, 1331.671, 1335.67, 1339.669, 1343.668, 1347.667, 1351.666, 1355.665, 1359.664, 1363.663, 1367.662, 1371.661, 1375.66, 1379.659, 1383.658, 1387.657, 1391.656, 1395.656, 1399.655, 1403.654, 1407.653, 1411.652, 1415.651, 1419.65, 1423.649, 1427.648, 1431.647, 1435.646, 1439.645, 1443.644, 1447.643, 1451.642, 1455.641, 1459.64, 1463.639, 1467.638, 1471.637, 1475.636, 1479.635, 1483.634, 1487.633, 1491.632, 1495.631, 1499.63, 1503.629, 1507.628, 1511.627, 1515.626, 1519.625, 1523.624, 1527.623, 1531.622, 1535.621, 1539.62, 1543.619, 1547.618, 1551.617, 1555.616, 1559.615, 1563.614, 1567.613, 1571.612, 1575.611, 1579.61, 1583.609, 1587.608, 1591.607, 1595.606, 1599.605, 1603.604, 1607.603, 1611.602, 1615.601, 1619.6, 1623.599, 1627.598, 1631.597, 1635.596, 1639.595, 1643.594, 1647.593, 1651.592, 1655.591, 1659.59, 1663.589, 1667.588, 1671.587, 1675.586, 1679.585, 1683.584, 1687.583, 1691.583, 1695.582, 1699.58, 1703.579, 1707.578, 1711.578, 1715.577, 1719.576, 1723.575, 1727.574, 1731.573, 1735.572, 1739.571, 1743.57, 1747.569, 1751.568, 1755.567, 1759.566, 1763.565, 1767.564, 1771.563, 1775.562, 1779.561, 1783.56, 1787.559, 1791.558, 1795.557, 1799.556, 1803.555, 1807.554, 1811.553, 1815.552, 1819.551, 1823.55, 1827.549, 1831.548, 1835.547, 1839.546, 1843.545, 1847.544, 1851.543, 1855.542, 1859.541, 1863.54, 1867.539, 1871.538, 1875.537, 1879.536, 1883.535, 1887.534, 1891.533, 1895.532, 1899.531, 1903.53, 1907.529, 1911.528, 1915.527, 1919.526, 1923.525, 1927.524, 1931.523, 1935.522, 1939.521, 1943.52, 1947.519, 1951.518, 1955.517, 1959.516, 1963.515, 1967.514, 1971.513, 1975.512, 1979.511, 1983.51, 1987.509, 1991.508, 1995.507, 1999.506, 2003.505, 2007.505, 2011.504, 2015.503, 2019.502, 2023.501]
}