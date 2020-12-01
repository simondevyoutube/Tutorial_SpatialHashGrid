import {math} from './math.js';


export const spatial_grid = (() => {
  
  class SpatialHash_Crap {
    constructor() {
      this._clients = new Set();
    }
  
    NewClient(position, dimensions) {
      const client = {
        position: position,
        dimensions: dimensions
      };
  
      this._Insert(client);
  
      return client;
    }
  
    UpdateClient(client) {
    }
  
    FindNear(position, dimensions) {
      const [x, y] = position;
      const [w, h] = dimensions;
  
      const searchBox = {
        position: position,
        dimensions: dimensions,
      };

      const _Overlaps = (a, b) => {
        const [aw, ah] = a.dimensions;
        const [bw, bh] = b.dimensions;
        return (Math.abs(a.position[0] - b.position[0]) * 2 < (aw + bw)) &&
               (Math.abs(a.position[1] - b.position[1]) * 2 < (ah + bh));
      };

      const results = [];

      for (let c of this._clients) {
        if (_Overlaps(searchBox, c)) {
          results.push(c);
        }
      }

      return results;
    }
  
    _Insert(client) {
      this._clients.add(client);
    }
  
    Remove(client) {
      this._clients.delete(client);
    }
  }

  class SpatialHash_Slow {
    constructor(bounds, dimensions) {
      const [x, y] = dimensions;
      this._cells = new Map();
      this._dimensions = dimensions;
      this._bounds = bounds;
    }
  
    _GetCellIndex(position) {
      const x = math.sat((position[0] - this._bounds[0][0]) / (
          this._bounds[1][0] - this._bounds[0][0]));
      const y = math.sat((position[1] - this._bounds[0][1]) / (
          this._bounds[1][1] - this._bounds[0][1]));
  
      const xIndex = Math.floor(x * (this._dimensions[0] - 1));
      const yIndex = Math.floor(y * (this._dimensions[1] - 1));
  
      return [xIndex, yIndex];
    }

    _Key(i1, i2) {
      return i1 + '.' + i2;
    }
  
    NewClient(position, dimensions) {
      const client = {
        position: position,
        dimensions: dimensions,
        indices: null,
      };
  
      this._Insert(client);
  
      return client;
    }
  
    UpdateClient(client) {
      this.Remove(client);
      this._Insert(client);
    }
  
    FindNear(position, bounds) {
      const [x, y] = position;
      const [w, h] = bounds;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
  
      const clients = new Set();
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
          const k = this._Key(x, y);

          if (k in this._cells) {
            for (let v of this._cells[k]) {
              clients.add(v);
            }
          }
        }
      }
      return clients;
    }
  
    _Insert(client) {
      const [x, y] = client.position;
      const [w, h] = client.dimensions;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
  
      client.indices = [i1, i2];
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
          const k = this._Key(x, y);
          if (!(k in this._cells)) {
            this._cells[k] = new Set();
          }
          this._cells[k].add(client);
        }
      }
    }
  
    Remove(client) {
      const [i1, i2] = client.indices;
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
          const k = this._Key(x, y);

          this._cells[k].delete(client);
        }
      }
    }
  }



  return {
    SpatialHash_Crap: SpatialHash_Crap,
    SpatialHash_Slow: SpatialHash_Slow,
  };

})();