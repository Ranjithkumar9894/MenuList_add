import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { Button, Card, Divider, Grid, Paper, TextField, Tooltip, Typography } from '@mui/material';
import ListTree from './component/listFeatures/index'

const item = {
  0: {
    id: 0,
    label: 'Item 1',
    childNodes: {
      1: {
        id: 1,
        label: 'Item 1.1',
        childNodes: {
          2: {
            id: 2,
            label: 'Item 1.1.1',
          },
          3: {
            id: 3,
            label: 'Item 1.1.2',
          }
        }
      },
      4: {
        id: 4,
        label: 'Item 1.2',
        childNodes: {
          5: {
            id: 5,
            label: 'Item 1.2.1',
          },
          6: {
            id: 6,
            label: 'Item 1.2.2',
          }
        }
      }
    }
  },
  7: {
    id: 7,
    label: 'Item 2',
    childNodes: {
      8: {
        id: 8,
        label: 'Item 2.1',
        childNodes: {
          9: {
            id: 9,
            label: 'Item 2.1.1',
          },
          10: {
            id: 10,
            label: 'Item 2.1.2',
          }
        }
      },
      11: {
        id: 11,
        label: 'Item 2.2',
        childNodes: {
          12: {
            id: 12,
            label: 'Item 2.2.1',
          },
          13: {
            id: 13,
            label: 'Item 2.2.2',
            childNodes: {
              14: {
                id: 14,
                label: 'Item 2.2.1',
              },
              15: {
                id: 15,
                label: 'Item 2.2.2',
              },
              16: {
                id: 16,
                label: 'Item 2.2.3',
              }
            }
          }
        }
      }
    }
  },
};
function App() {
  const [leftSide, setLeftSide] = useState({});
  const [rightSide, setRightSide] = useState({});
  const [selectedNodes, setSelectedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initiliseData();
  }, [item]);

  const initiliseData = () => {
    Object.values(JSON.parse(JSON.stringify(item))).map((childNode) => {
      childNode['parentNode'] = undefined;
      addParentRefs(childNode);
      setLeftSide((preVal) => ({ ...preVal, [childNode.id]: childNode }));
    });
  }

  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  function mergeDeep(target, source) {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = mergeDeep(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  const addParentRefToItems = (currentNode, childNodes) => {
    if (!currentNode) {
      setLeftSide((preVal) => mergeDeep(preVal, childNodes));
    } else {
      const currentParent = {
        [currentNode.id]: {
          label: currentNode.label,
          childNodes: childNodes
        }
      };
      addParentRefToItems(currentNode.parentNode, currentParent);
    }
  };

  const addParentRefs = (currentNode) => {
    if (currentNode.childNodes) {
      const keys = Object.keys(currentNode.childNodes);
      for (let i = 0; i < keys.length; i++) {
        currentNode.childNodes[keys[i]]['parentNode'] = currentNode;
        addParentRefs(currentNode.childNodes[keys[i]]);
      }
    }
  }

  const isNodeSelected = useCallback((itemId) => {
    return !!selectedNodes[itemId];
  }, [selectedNodes]);

  const removeMovedNodes = (currentNode) => {
    if (!currentNode) return;
    if (isNodeSelected(currentNode.id) && !(currentNode.parentNode && currentNode.childNodes)) {
      setLeftSide((preVal) => {
        delete preVal[currentNode.id];
        return preVal;
      });
    }
    if (currentNode.childNodes) {
      const childValues = Object.values(currentNode.childNodes);
      const selectChilds = childValues.filter(childNode => isNodeSelected(childNode.id));
      if (selectChilds.length === childValues.length) {
        delete currentNode.childNodes;
      } else if (selectChilds.length) {
        for (let i = 0; i < childValues.length; i++) {
          if (isNodeSelected(childValues[i].id)) {
            delete currentNode.childNodes[childValues[i].id];
          }
        }
      }
    }
    removeMovedNodes(currentNode.parentNode);
  }

  const moveAllLeft = () => {
    setRightSide((preVal) => mergeDeep(preVal, leftSide));
    setLeftSide({});
    setSelectedNodes({});
  }
  const moveAllRight = () => {
    initiliseData();
    setRightSide({});
  }
  const moveSelectedItemsRootFn = () => {
    const childsModed = [];
    let rightList = {};
    function isObject(item) {
      return (item && typeof item === 'object' && !Array.isArray(item));
    }

    function mergeDeep(target, source) {
      let output = Object.assign({}, target);
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
          if (isObject(source[key])) {
            if (!(key in target))
              Object.assign(output, { [key]: source[key] });
            else
              output[key] = mergeDeep(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }

    const addItem = (currentNode, childNodes) => {
      if (!currentNode) {
        rightList = mergeDeep(rightList, childNodes);
      } else {
        const currentParent = {
          [currentNode.id]: {
            id: currentNode.id,
            label: currentNode.label,
            childNodes: { ...childNodes }
          }
        };
        addItem(currentNode.parentNode, currentParent);
      }
    };


    const moveSelectedItems = (currentNode) => {
      if (currentNode.childNodes) {
        const keys = Object.keys(currentNode.childNodes);
        for (let i = 0; i < keys.length; i++) {
          moveSelectedItems(currentNode.childNodes[keys[i]]);
        }
      } else if (isNodeSelected(currentNode.id)) {
        addItem(currentNode, {});
        childsModed.push(currentNode);
      }
    }

    const keys = Object.keys(leftSide);
    for (let i = 0; i < keys.length; i++) {
      moveSelectedItems(leftSide[keys[i]]);
    }
    setRightSide((preVal) => mergeDeep(preVal, { ...rightList }));
    childsModed.map((cn) => removeMovedNodes(cn));
    setSelectedNodes({});
  }


  const handleSearchChange = (query) => {
    setSearchQuery(query.target.value);
    filterItems(query.target.value);
  };

  const filterItems = (query) => {
    const filtered = {};

    const filterRecursive = (node, parentKey) => {
      Object.keys(node).forEach((key) => {
        const item = node[key];
        if (item.label.toLowerCase().includes(query.toLowerCase())) {
          filtered[parentKey] = {
            ...filtered[parentKey],
            [key]: item,
          };
        }
        if (item.childNodes) {
          filterRecursive(item.childNodes, key);
        }
      });
    };

    filterRecursive(leftSide, null);
    setLeftSide(filtered);
  };

  const customList = (left, right) => (
    <Paper sx={{ overflow: 'auto', height: 500 }}>
      <Grid px={2} py={2}>
        {left === 'left' ?
          <TextField fullWidth id="outlined-basic" label="Search"
            // value={searchQuery}
            // onChange={handleSearchChange}
            variant="outlined" size='small' /> : <Typography px={0.5} py={0.5} >Chosen List</Typography>
        }
      </Grid>
      <Divider />
      {console.log('1233', left == 'left' ? leftSide : rightSide, left)
      }
      <ListTree isNodeSelected={isNodeSelected} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} item={left === 'left' ? leftSide : rightSide} left={left} />
    </Paper>

  );

  return (
    <div className="App">
      <Grid container lg={10} margin='auto'>
        <Card variant='elevation' sx={{ padding: 2, width: '100%' }}>
          <Typography variant='h6'>Basic 456</Typography>
          <Grid container lg={12} md={12} xs={12} spacing={2}>
            <Grid item lg={4} md={6} xs={12}>
              <Grid container lg={12}>
                <Grid item lg={5}><Typography>year</Typography></Grid>
                <Grid item lg={7}><Typography color={'#727272'}>: 2023</Typography></Grid>
              </Grid>
              <Grid container lg={12}>
                <Grid item lg={5}><Typography>Collage</Typography></Grid>
                <Grid item lg={7}><Tooltip title='SRM college of engineerin'><Typography color={'#727272'} noWrap >: SRM college of engineering</Typography></Tooltip></Grid>
              </Grid>
            </Grid>
            <Grid item lg={2} md={6} xs={12}>  <Grid container lg={12}>
              <Grid item lg={5}><Typography>Category</Typography></Grid>
              <Grid item lg={7}><Typography color={'#727272'}>: 6</Typography></Grid>
            </Grid>
              <Grid container lg={12}>
                <Grid item lg={5}><Typography>Course</Typography></Grid>
                <Grid item lg={7}><Typography color={'#727272'}>: 4</Typography></Grid>
              </Grid></Grid>
            <Grid item lg={4} md={6} xs={12}>
              <Grid container lg={12}>
                <Grid item lg={5}><Typography>Last updated on</Typography></Grid>
                <Grid item lg={7}><Typography color={'#727272'}>: 25 Feb 2023</Typography></Grid>
              </Grid>
              <Grid container lg={12}>
                <Grid item lg={5}><Typography>Created by</Typography></Grid>
                <Grid item lg={7}><Typography color={'#727272'}>: Admin</Typography></Grid>
              </Grid>
            </Grid>
            <Grid item lg={2} md={6} sm={12} textAlign='end'>
              <Button variant='outlined' color='primary'>
                Edit
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Grid container lg={10} margin='auto' py={1}>
        <Typography variant='body1'>Select category and course*</Typography>
      </Grid>
      <Grid container lg={10} margin='auto' justifyContent="center" alignItems="center">
        <Grid item lg={5} md={5} sm={5} xs={12}>{customList('left', leftSide)}</Grid>
        <Grid item lg={2} md={2} sm={2} xs={12}>
          <Grid container direction="column" alignItems="center">
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={() => {
                moveAllLeft()
              }}
              disabled={leftSide.length === 0}
            >
              &gt;&gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={() => {
                console.log(selectedNodes);
                moveSelectedItemsRootFn();
              }}
            // disabled={leftChecked.length === 0}
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              // onClick={handleCheckedLeft}
              disabled={true}
            >
              &lt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={() => {
                moveAllRight()
              }}
              disabled={rightSide.length === 0}
            >
              &lt;&lt;
            </Button>
          </Grid>
        </Grid>
        <Grid item lg={5} md={5} sm={5} xs={12}>{customList('right', rightSide)}</Grid>
      </Grid>
    </div>
  );
}

export default App;
