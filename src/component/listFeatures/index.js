import { Checkbox, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
const TreeNode = ({ left, isNodeSelected, selectedNodes, setSelectedNodes, node }) => {
    const [expanded, setExpanded] = useState(false);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const renderChildren = () => {
        if (node.childNodes && expanded) {
            return Object.values(node.childNodes).map((childNode, index) => (
                <TreeNode left={left} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} isNodeSelected={isNodeSelected} key={index} node={childNode} />
            ));
        }
        return null;
    };

    const hasChildren = () => {
        return node.childNodes && Object.keys(node.childNodes).length > 0;
    };

    const markChildNodes = (currentNode, targetVal, currentSelectedNodes) => {
        currentSelectedNodes[currentNode.id] = targetVal;
        if (currentNode.childNodes) {
            const keys = Object.keys(currentNode.childNodes);
            for (let i = 0; i < keys.length; i++) {
                markChildNodes(currentNode.childNodes[keys[i]], targetVal, currentSelectedNodes);
            }
        }
    }

    const markParentNodes = (currentNode, currentSelectedNodes) => {
        if (!currentNode) {
            return;
        }
        if (currentNode.childNodes) {
            const childValues = Object.values(currentNode.childNodes);
            const selectChilds = childValues.filter(childNode => currentSelectedNodes[childNode.id]);
            currentSelectedNodes[currentNode.id] = (selectChilds.length === childValues.length);
            markParentNodes(currentNode.parentNode, currentSelectedNodes);
        }
    }

    return (
        <div style={{ marginLeft: 60, marginTop: 5, marginRight: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>


                {hasChildren() && (
                    <IconButton onClick={toggleExpanded}>
                        {expanded ? <ExpandMoreIcon /> : <KeyboardArrowRightIcon />}
                    </IconButton>
                )}

                {left === 'left' &&
                    <Checkbox onClick={() => {
                        const updatedVal = !selectedNodes[node.id];
                        const currentSelectedNodes = { ...selectedNodes, [node.id]: updatedVal };
                        if (node.childNodes) {
                            Object.values(node.childNodes).map((childNode) => {
                                markChildNodes(childNode, updatedVal, currentSelectedNodes);
                            });
                        }
                        markParentNodes(node.parentNode, currentSelectedNodes);
                        setSelectedNodes(currentSelectedNodes);
                    }} checked={isNodeSelected(node.id)} size='medium' />
                }
                <Typography>{node.label}</Typography>
            </div>

            {renderChildren()}

        </div>
    );
};

const TreeView = ({ left, isNodeSelected, selectedNodes, setSelectedNodes, tree }) => {
    return Object.values(tree).map((node, index) => (
        <>
            <TreeNode left={left} isNodeSelected={isNodeSelected} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} key={index} node={node} />
        </>
    ));
};

const listFeatures = ({ left, isNodeSelected, selectedNodes, setSelectedNodes, item }) => {
    return <TreeView left={left} isNodeSelected={isNodeSelected} selectedNodes={selectedNodes} setSelectedNodes={setSelectedNodes} tree={item} />;
};

export default listFeatures;
