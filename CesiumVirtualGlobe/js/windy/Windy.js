//= ====================Particle=================================
var Particle = function () {
  this.x = null
  this.dx = null
  this.dx = null
  this.y = null
  this.age = null
  this.birthAge = null
  this.path = null
}

//= ====================WindField=================================
var WindField = function (obj) {
  this.west = null
  this.east = null
  this.south = null
  this.north = null
  this.rows = null
  this.cols = null
  this.dx = null
  this.dy = null
  this.unit = null
  this.date = null

  this.grid = null
  this._init(obj)
}

WindField.prototype = {
  constructor: WindField,
  _init: function (obj) {
    var header = obj.header

    var uComponent = obj['uComponent']

    var vComponent = obj['vComponent']

    this.west = +header['lo1']
    this.east = +header['lo2']
    this.south = +header['la2']
    this.north = +header['la1']
    this.rows = +header['ny']
    this.cols = +header['nx']
    this.dx = +header['dx']
    this.dy = +header['dy']
    this.unit = header['parameterUnit']
    this.date = header['refTime']

    this.grid = []
    var k = 0

    var rows = null

    var uv = null
    for (var j = 0; j < this.rows; j++) {
      rows = []
      for (var i = 0; i < this.cols; i++, k++) {
        uv = this._calcUV(uComponent[k], vComponent[k])
        rows.push(uv)
      }
      this.grid.push(rows)
    }
  },
  _calcUV: function (u, v) {
    return [+u, +v, Math.sqrt(u * u + v * v)]
  },
  _bilinearInterpolation: function (x, y, g00, g10, g01, g11) {
    var rx = 1 - x
    var ry = 1 - y
    var a = rx * ry

    var b = x * ry

    var c = rx * y

    var d = x * y
    var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d
    var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d
    return this._calcUV(u, v)
  },
  getIn: function (x, y) {
    var x0 = Math.floor(x)

    var y0 = Math.floor(y)

    var x1

    var y1
    if (x0 === x && y0 === y) return this.grid[y][x]

    x1 = x0 + 1
    y1 = y0 + 1

    var g00 = this.getIn(x0, y0)

    var g10 = this.getIn(x1, y0)

    var g01 = this.getIn(x0, y1)

    var g11 = this.getIn(x1, y1)
    return this._bilinearInterpolation(x - x0, y - y0, g00, g10, g01, g11)
  },
  isInBound: function (x, y) {
    if (x >= 0 && x < this.cols - 2 && (y >= 0 && y < this.rows - 2)) {
      return true
    }
    return false
  }
}

//= ====================Windy=================================

var _primitives = null
var SPEED_RATE = 1.0
var PARTICLES_NUMBER = 2000
var MAX_AGE = 35
// var MAX_AGE = 25
var BRIGHTEN = 1

var Windy = function (json, cesiumViewer) {
  this.windData = json
  this.windField = null
  this.particles = []
  this.lines = null
  _primitives = cesiumViewer.scene.primitives
  this._init()
}
Windy.prototype = {
  constructor: Windy,
  _init: function () {
    // 创建风场网格
    this.windField = this.createField()
    // 创建风场粒子
    for (var i = 0; i < PARTICLES_NUMBER; i++) {
      this.particles.push(this.randomParticle(new Particle()))
    }
  },
  createField: function () {
    var data = this._parseWindJson()
    return new WindField(data)
  },
  animate: function () {
    var self = this

    var field = self.windField

    var particles = self.particles

    var instances = []

    var nextX = null

    var nextY = null

    var xy = null

    var uv = null
    particles.forEach(function (particle) {
      if (particle.age <= 0) {
        self.randomParticle(particle)
      }
      if (particle.age > 0) {
        var x = particle.x

        var y = particle.y

        if (!field.isInBound(x, y)) {
          particle.age = 0
        } else {
          uv = field.getIn(x, y)
          nextX = x + SPEED_RATE * uv[0]
          nextY = y + SPEED_RATE * uv[1]
          particle.path.push(nextX, nextY)
          particle.x = nextX
          particle.y = nextY
          instances.push(
            self._createLineInstance(
              self._map(particle.path),
              particle.age / particle.birthAge
            )
          )
          particle.age--
        }
      }
    })
    if (instances.length <= 0) this.removeLines()
    self._drawLines(instances)
  },
  _parseWindJson: function () {
    var uComponent = null

    var vComponent = null

    var header = null
    this.windData.forEach(function (record) {
      var type =
        record.header.parameterCategory + ',' + record.header.parameterNumber
      switch (type) {
        case '2,2':
          uComponent = record['data']
          header = record['header']
          break
        case '2,3':
          vComponent = record['data']
          break
        default:
          break
      }
    })
    return {
      header: header,
      uComponent: uComponent,
      vComponent: vComponent
    }
  },
  removeLines: function () {
    if (this.lines) {
      _primitives.remove(this.lines)
      this.lines.destroy()
    }
  },
  _map: function (arr) {
    var length = arr.length

    var field = this.windField

    var dx = field.dx

    var dy = field.dy

    var west = field.west

    var south = field.north

    var newArr = []
    for (var i = 0; i <= length - 2; i += 2) {
      newArr.push(west + arr[i] * dx, south - arr[i + 1] * dy)
    }
    return newArr
  },
  _createLineInstance: function (positions, ageRate) {
    var colors = []

    var length = positions.length

    var count = length / 2
    for (var i = 0; i < length; i++) {
      colors.push(Cesium.Color.WHITE.withAlpha((i / count) * ageRate * BRIGHTEN))
      // if (ageRate > 0.75) {
      //   colors.push(
      //     Cesium.Color.RED.withAlpha((i / count) * ageRate * BRIGHTEN)
      //   )
      // } else if (ageRate <= 0.75 && ageRate > 0.5) {
      //   colors.push(
      //     {
      //       red: 246 / 255,
      //       green: 135/255,
      //       blue: 135/255,
      //       alpha: (i / count) * ageRate * BRIGHTEN
      //     }
      //     // Cesium.Color.YELLOW.withAlpha((i / count) * ageRate * BRIGHTEN)
      //   )
      // } else if (ageRate <= 0.5 && ageRate > 0.25) {
      //   colors.push(
      //     {
      //       red: 246 / 255,
      //       green: 171/255,
      //       blue: 171/255,
      //       alpha: (i / count) * ageRate * BRIGHTEN
      //     }
      //     // Cesium.Color.YELLOW.withAlpha((i / count) * ageRate * BRIGHTEN)
      //   )
      // } else if (ageRate <= 0.25 && ageRate >= 0) {
      //   colors.push(
      //     {
      //       red: 250 / 255,
      //       green: 226/255,
      //       blue: 226/255,
      //       alpha: (i / count) * ageRate * BRIGHTEN
      //     }
      //     // Cesium.Color.YELLOW.withAlpha((i / count) * ageRate * BRIGHTEN)
      //   )
      // }
    }
    return new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(positions),
        colors: colors,
        width: 1.5,
        colorsPerVertex: true
      })
    })
  },
  _drawLines: function (lineInstances) {
    this.removeLines()
    var linePrimitive = new Cesium.Primitive({
      appearance: new Cesium.PolylineColorAppearance({
        translucent: true
      }),
      geometryInstances: lineInstances,
      asynchronous: false
    })
    this.lines = _primitives.add(linePrimitive)
  },
  randomParticle: function (particle) {
    var safe = 30

    var x

    var y
    do {
      x = Math.floor(Math.random() * (this.windField.cols - 2))
      y = Math.floor(Math.random() * (this.windField.rows - 2))
    } while (this.windField.getIn(x, y)[2] <= 0 && safe++ < 30)

    particle.x = x
    particle.y = y
    particle.age = Math.round(Math.random() * MAX_AGE)
    particle.birthAge = particle.age
    particle.path = [x, y]
    return particle
  }
}
