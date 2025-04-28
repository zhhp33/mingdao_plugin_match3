import React, { useEffect, useState, useRef } from "react";
import { env, config, api, utils } from "mdye";
import styled from "styled-components";
import "./style.less";
import FieldDisplay, { parseFieldData } from "./components/FieldDisplay";
import _ from "lodash";

// 样式组件
const Container = styled.div`
  height: 100vh;
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  margin-bottom: 16px;
  border-radius: 6px;
`;

const Title = styled.div`
  font-size: 16px;
  color: #222;
  font-weight: 500;
`;

const InfoDisplay = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #333;
  
  > div {
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
  }
  
  .score {
    color: #f5222d;
    font-weight: 500;
  }
  
  .moves {
    color: #1677ff;
    font-weight: 500;
  }
  
  .complete {
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      height: 2px;
      width: ${props => props.percent || 0}%;
      background-color: #ccc;
      transition: width 0.3s ease-in-out;
    }
  }
`;

const Celebration = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  
  .fireworks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  
  .firework {
    position: absolute;
    opacity: 0;
  }
`;

const ContinueButton = styled.button`
  padding: 12px 24px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  
  &:hover {
    background: #0e62da;
    transform: scale(1.05);
  }
`;

const GameBoard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  width: 100%;
  margin: 0 auto;
`;

const GameArea = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
  position: relative;
`;

const Cell = styled.div`
  flex: 1;
  min-height: 50px;
  display: flex;
    justify-content: center;
    align-items: center;
  cursor: pointer;
  user-select: none;
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  background-color: ${props => props.isSelected ? '#e6f7ff' : '#fff'};
  overflow: hidden;
  font-size: ${props => props.isTextContent ? '14px' : '24px'};
  
  &:hover {
    background-color: ${props => props.isSelected ? '#e6f7ff' : '#f0f0f0'};
  }
  
  img {
    max-width: 95%;
    max-height: 95%;
    object-fit: contain;
  }
`;

const Row = styled.div`
  display: flex;
  flex: 1;
`;

const TableHeader = styled.div`
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
`;

const HeaderCell = styled.div`
  flex: 1;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #666;
  border-right: 1px solid #e8e8e8;
  background-color: #fafafa;
  font-weight: 500;
`;

const SideHeader = styled.div`
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #666;
  background-color: #fafafa;
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 500;
`;

const ScorePopup = styled.div`
  position: absolute;
  color: #1677ff;
      font-weight: bold;
  font-size: 18px;
  pointer-events: none;
  animation: scoreFloat 1s forwards;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const GameOver = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  z-index: 1000;
`;

const GameOverTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #1677ff;
`;

const RestartButton = styled.button`
  padding: 8px 20px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: #fff;
  cursor: pointer;
  outline: none;
      font-size: 16px;
  color: #333;
  margin-top: 16px;
  
  &:hover {
    color: #1677ff;
    border-color: #1677ff;
  }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  font-size: 18px;
`;

const HintText = styled.div`
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
`;

// 在CSS样式中添加烟花动画
const FireworkAnimation = styled.div`
  @keyframes firework {
    0% {
      opacity: 0;
      transform: scale(0.1);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(1.2);
    }
  }
`;

// 主游戏组件
export default function App() {
  const { appId, worksheetId, viewId, controls } = config;
  const { gameFields, rowHeightMode } = env;
  
  // 游戏状态
  const [board, setBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // 最高分
  const [moves, setMoves] = useState(30); // 限制移动次数
  const [gameOver, setGameOver] = useState(false);
  const [animations, setAnimations] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [fieldIcons, setFieldIcons] = useState([]);
  const [cascadeCount, setCascadeCount] = useState(0); // 追踪级联次数
  const [scorePercent, setScorePercent] = useState(0); // 分数进度百分比
  const [isCompactMode, setIsCompactMode] = useState(true); // 紧凑模式默认开启
  
  // 使用固定的游戏大小，降低复杂性
  const rows = 8;
  const cols = 8; 
  
  // 初始化时，根据配置设置紧凑模式
  useEffect(() => {
    setIsCompactMode(true); // 默认紧凑模式
  }, []);
  
  // 从本地存储加载最高分
  useEffect(() => {
    const savedHighScore = localStorage.getItem('saoleiHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);
  
  // 监听当前分数，更新最高分
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('saoleiHighScore', score.toString());
    }
    
    // 计算分数进度百分比
    const percent = highScore > 0 ? Math.min(100, Math.floor((score / highScore) * 100)) : 0;
    setScorePercent(percent);
  }, [score, highScore]);
  
  // 获取数据记录
  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        // 如果没有配置游戏字段，使用默认图标
        if (!gameFields || gameFields.length === 0) {
          console.log("没有配置游戏字段，使用默认图标");
          initGame([]); // 使用默认图标
          return;
        }
        
        // 获取记录数据
        const result = await api.getFilterRows({
          worksheetId,
          viewId,
          pageSize: 100,
          pageIndex: 1
        });
        
        setRecords(result.data || []);
        
        // 处理记录，提取字段作为游戏图标
        const icons = [];
        
        if (result.data && result.data.length > 0) {
          // 获取字段对应的控件配置
          const fieldControls = gameFields.map(fieldId => {
            return controls.find(control => control.controlId === fieldId);
          }).filter(Boolean);
          
          // 验证是否找到了控件配置
          if (fieldControls.length === 0) {
            console.warn("未找到对应的字段控件配置");
            initGame([]); // 使用默认图标
            return;
          }
          
          // 每条记录的指定字段都可以作为图标
          try {
            result.data.forEach(record => {
              gameFields.forEach(fieldId => {
                const control = controls.find(c => c.controlId === fieldId);
                if (control && record[fieldId]) {
                  const value = record[fieldId];
                  try {
                    const displayValue = parseFieldData(value, control);
                    
                    if (displayValue && displayValue !== '') {
                      const icon = {
                        fieldId,
                        control,
                        value,
                        displayValue
                      };
                      
                      // 避免重复添加相同的图标
                      const exists = icons.some(item => 
                        item.fieldId === icon.fieldId && 
                        JSON.stringify(item.value) === JSON.stringify(icon.value)
                      );
                      
                      if (!exists) {
                        icons.push(icon);
                      }
                    }
                  } catch (error) {
                    console.error("解析单个字段值失败:", error);
                    // 继续处理其他字段
                  }
                }
              });
            });
          } catch (error) {
            console.error("处理记录数据时出错:", error);
          }
        }
        
        // 默认emoji图标
        const emojiIcons = [
          { displayValue: '📊' },
          { displayValue: '📝' },
          { displayValue: '🔢' },
          { displayValue: '📅' },
          { displayValue: '📈' },
          { displayValue: '📉' },
          { displayValue: '💰' },
          { displayValue: '🔍' },
        ];
        
        // 如果图标超过8种，随机选择8种
        let gameIcons = [...icons];
        if (gameIcons.length > 8) {
          // 随机打乱数组
          const shuffled = [...icons].sort(() => Math.random() - 0.5);
          // 取前8个
          gameIcons = shuffled.slice(0, 8);
          console.log(`限制图标数量，从${icons.length}个减少到8个`);
        } else if (gameIcons.length > 0 && gameIcons.length < 8) {
          // 如果字段图标不足8种，补充emoji图标
          const needToAdd = 8 - gameIcons.length;
          console.log(`字段图标不足8种，补充${needToAdd}个emoji图标`);
          
          // 随机选择emoji补充
          const shuffledEmoji = [...emojiIcons].sort(() => Math.random() - 0.5);
          for (let i = 0; i < needToAdd; i++) {
            gameIcons.push(shuffledEmoji[i % shuffledEmoji.length]);
          }
        } else if (gameIcons.length === 0) {
          // 如果没有有效字段图标，使用全部emoji
          console.log("没有有效字段图标，使用全部emoji");
          gameIcons = [...emojiIcons];
        }
        
        console.log(`成功加载 ${gameIcons.length} 个游戏图标，其中字段图标 ${icons.length} 个`);
        setFieldIcons(gameIcons);
        initGame(gameIcons);
      } catch (error) {
        console.error("获取数据失败:", error);
        initGame([]); // 出错时使用默认图标
      }
    }
    
    fetchRecords();
  }, [gameFields]);
  
  // 清除动画效果
  useEffect(() => {
    if (animations.length > 0) {
      const timer = setTimeout(() => {
        setAnimations([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animations]);
  
  // 清除得分弹窗
  useEffect(() => {
    if (scorePopups.length > 0) {
      const timer = setTimeout(() => {
        setScorePopups([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [scorePopups]);
  
  // 添加异常状态处理
  useEffect(() => {
    // 如果获取数据超过10秒仍未完成，显示加载失败
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error("数据加载超时");
        setLoading(false);
        initGame([]); // 使用默认图标
      }
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);
  
  // 初始化游戏
  const initGame = (icons) => {
    // 创建游戏板
    const newBoard = generateBoard(rows, cols, icons);
    setBoard(newBoard);
    setSelectedCell(null);
    setScore(0);
    setMoves(30);
    setGameOver(false);
    setAnimations([]);
    setScorePopups([]);
    setLoading(false);
  };
  
  // 生成游戏板
  const generateBoard = (rows, cols, icons) => {
    try {
      if (!rows || !cols) return [];
      
      // 使用字段图标，如果没有则使用默认图标
      let gameIcons = icons && icons.length > 0 ? [...icons] : [
        { displayValue: '📊' },
        { displayValue: '📝' },
        { displayValue: '🔢' },
        { displayValue: '📅' },
        { displayValue: '📈' },
        { displayValue: '📉' },
        { displayValue: '💰' },
        { displayValue: '🔍' },
      ];
      
      // 过滤掉无效图标并限制最多8种
      gameIcons = gameIcons
        .filter(icon => icon && (icon.displayValue !== undefined && icon.displayValue !== null))
        .slice(0, 8);
      
      // 如果过滤后没有可用图标，使用默认图标
      if (gameIcons.length === 0) {
        gameIcons = [
          { displayValue: '📊' },
          { displayValue: '📝' },
          { displayValue: '🔢' },
          { displayValue: '📅' },
          { displayValue: '📈' },
          { displayValue: '📉' },
          { displayValue: '💰' },
          { displayValue: '🔍' },
        ];
      }
      
      // 确保至少有3种图标
      if (gameIcons.length < 3) {
        const defaultIcons = [
          { displayValue: '📊' },
          { displayValue: '📝' },
          { displayValue: '🔢' }
        ];
        
        while (gameIcons.length < 3) {
          gameIcons.push(defaultIcons[gameIcons.length % defaultIcons.length]);
        }
      }
      
      // 直接创建棋盘，确保没有初始的匹配
      let board = createNonMatchingBoard(rows, cols, gameIcons);
      
      // 验证生成的棋盘没有匹配
      const initialMatches = findMatches(board);
      if (initialMatches.length > 0) {
        console.log("初始棋盘有匹配，重新生成");
        return generateBoard(rows, cols, icons);
      }
      
      return board;
    } catch (error) {
      console.error("生成游戏板失败:", error);
      
      // 返回一个简单的默认棋盘
      const defaultBoard = [];
      const defaultIcons = [
        { displayValue: '📊' },
        { displayValue: '📝' },
        { displayValue: '🔢' },
        { displayValue: '📅' },
        { displayValue: '📈' },
        { displayValue: '📉' },
        { displayValue: '💰' },
        { displayValue: '🔍' },
      ];
      
      for (let row = 0; row < rows; row++) {
        let rowArr = [];
        for (let col = 0; col < cols; col++) {
          const iconIndex = (row * cols + col) % defaultIcons.length;
          rowArr.push({
            icon: defaultIcons[iconIndex],
            isEmpty: false
          });
        }
        defaultBoard.push(rowArr);
      }
      
      return defaultBoard;
    }
  };
  
  // 创建一个没有匹配的棋盘
  const createNonMatchingBoard = (rows, cols, icons) => {
    // 创建空棋盘
    let board = Array(rows).fill().map(() => Array(cols).fill(null));
    
    // 按顺序填充棋盘，避免匹配
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 获取当前位置上方和左侧相邻的图标
        const above1 = row >= 1 ? board[row-1][col] : null;
        const above2 = row >= 2 ? board[row-2][col] : null;
        const left1 = col >= 1 ? board[row][col-1] : null;
        const left2 = col >= 2 ? board[row][col-2] : null;
        
        // 创建不能使用的图标列表
        const forbiddenIcons = [];
        
        // 检查垂直方向
        if (above1 && above2 && above1.icon && above2.icon && 
            isSameIconValue(above1.icon, above2.icon)) {
          forbiddenIcons.push(above1.icon);
        }
        
        // 检查水平方向
        if (left1 && left2 && left1.icon && left2.icon && 
            isSameIconValue(left1.icon, left2.icon)) {
          forbiddenIcons.push(left1.icon);
        }
        
        // 过滤出可用的图标
        const availableIcons = icons.filter(icon => 
          !forbiddenIcons.some(forbidden => isSameIconValue(icon, forbidden))
        );
        
        // 如果有可用图标，随机选择一个
        if (availableIcons.length > 0) {
          const iconIndex = Math.floor(Math.random() * availableIcons.length);
          board[row][col] = {
            icon: availableIcons[iconIndex],
            isEmpty: false
          };
        } else {
          // 如果没有可用图标，随机选择一个不同于前两个的图标
          let randomIcon;
          do {
            const iconIndex = Math.floor(Math.random() * icons.length);
            randomIcon = icons[iconIndex];
          } while (
            (above1 && above2 && isSameIconValue(randomIcon, above1.icon) && isSameIconValue(randomIcon, above2.icon)) ||
            (left1 && left2 && isSameIconValue(randomIcon, left1.icon) && isSameIconValue(randomIcon, left2.icon))
          );
          
          board[row][col] = {
            icon: randomIcon,
            isEmpty: false
          };
        }
      }
    }
    
    return board;
  };
  
  // 查找匹配的图标
  const findMatches = (gameBoard) => {
    const matches = [];
    const rows = gameBoard.length;
    const cols = gameBoard[0].length;
    
    // 比较两个图标是否相同
    const isSameIcon = (icon1, icon2) => {
      try {
        if (!icon1 || !icon2 || icon1.isEmpty || icon2.isEmpty) {
          return false;
        }
        
        // 防止无效数据
        if (!icon1.icon || !icon2.icon || 
            !icon1.icon.displayValue || !icon2.icon.displayValue) {
          return false;
        }
        
        // 比较两个图标对象
        if (typeof icon1.icon.displayValue === 'object' && typeof icon2.icon.displayValue === 'object') {
          // 如果是图片或文件类型，比较URL
          if (icon1.icon.displayValue.type === 'image' && icon2.icon.displayValue.type === 'image') {
            return icon1.icon.displayValue.url === icon2.icon.displayValue.url;
          }
          if (icon1.icon.displayValue.type === 'file' && icon2.icon.displayValue.type === 'file') {
            return icon1.icon.displayValue.name === icon2.icon.displayValue.name;
          }
          // 如果是选项字段，比较key值
          if (icon1.icon.displayValue.type === 'option' && icon2.icon.displayValue.type === 'option') {
            // 验证options数组存在
            if (!Array.isArray(icon1.icon.displayValue.options) || 
                !Array.isArray(icon2.icon.displayValue.options)) {
              return false;
            }
            
            // 如果两个都只有一个选项，比较选项的key
            if (icon1.icon.displayValue.options.length === 1 && 
                icon2.icon.displayValue.options.length === 1 &&
                icon1.icon.displayValue.options[0] && 
                icon2.icon.displayValue.options[0]) {
              return icon1.icon.displayValue.options[0].key === icon2.icon.displayValue.options[0].key;
            }
            // 如果选项数量不同，则不相同
            return false;
          }
          return false;
        }
        
        // 直接比较显示值
        return icon1.icon.displayValue === icon2.icon.displayValue;
      } catch (e) {
        console.error("比较图标失败:", e);
        return false; // 出错时认为不相同
      }
    };
    
    // 检查行匹配
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 2; col++) {
        const cell1 = gameBoard[row][col];
        const cell2 = gameBoard[row][col + 1];
        const cell3 = gameBoard[row][col + 2];
        
        if (
          !cell1.isEmpty && !cell2.isEmpty && !cell3.isEmpty &&
          isSameIcon(cell1, cell2) && isSameIcon(cell2, cell3)
        ) {
          matches.push([
            { row, col },
            { row, col: col + 1 },
            { row, col: col + 2 }
          ]);
        }
      }
    }
    
    // 检查列匹配
    for (let row = 0; row < rows - 2; row++) {
      for (let col = 0; col < cols; col++) {
        const cell1 = gameBoard[row][col];
        const cell2 = gameBoard[row + 1][col];
        const cell3 = gameBoard[row + 2][col];
        
        if (
          !cell1.isEmpty && !cell2.isEmpty && !cell3.isEmpty &&
          isSameIcon(cell1, cell2) && isSameIcon(cell2, cell3)
        ) {
          matches.push([
            { row, col },
            { row: row + 1, col },
            { row: row + 2, col }
          ]);
        }
      }
    }
    
    return matches;
  };
  
  // 清除匹配的图标
  const clearMatches = (gameBoard, matches) => {
    if (!matches || matches.length === 0) return gameBoard;
    
    const newBoard = JSON.parse(JSON.stringify(gameBoard));
    const cellsToAnimate = [];
    
    matches.forEach(match => {
      match.forEach(({ row, col }) => {
        if (newBoard[row] && newBoard[row][col]) {
          newBoard[row][col].isEmpty = true;
          cellsToAnimate.push({ row, col });
        }
      });
    });
    
    // 设置动画状态
    setAnimations(cellsToAnimate);
    
    // 添加得分，只在用户操作触发的匹配才加分
    // 使用setTimeout确保在渲染后再添加得分
    setTimeout(() => {
      // 计算需要添加的分数
      const matchesPoints = matches.length * 10;
      
      // 只有在游戏未结束时才添加得分
      if (!gameOver) {
        setScore(prev => prev + matchesPoints);
        
        // 添加得分弹窗
        if (matches.length > 0) {
          const firstMatch = matches[0][0];
          if (firstMatch) {
            setScorePopups(prev => [...prev, {
              id: Date.now(),
              points: matchesPoints,
              position: { row: firstMatch.row, col: firstMatch.col }
            }]);
          }
        }
      }
    }, 100);
    
    return newBoard;
  };
  
  // 填充空单元格
  const fillEmptyCells = (gameBoard, icons) => {
    try {
      // 深拷贝确保不修改原始棋盘
      const newBoard = JSON.parse(JSON.stringify(gameBoard));
      const rows = newBoard.length;
      const cols = newBoard[0].length;
      
      // 区分用户选择的图标和默认emoji图标
      let userIcons = icons && icons.length > 0 ? [...icons].filter(icon => icon && icon.fieldId) : [];
      let emojiIcons = [
        { displayValue: '📊' },
        { displayValue: '📝' },
        { displayValue: '🔢' },
        { displayValue: '📅' },
        { displayValue: '📈' },
        { displayValue: '📉' },
        { displayValue: '💰' },
        { displayValue: '🔍' },
      ];
      
      // 根据用户图标数量补充emoji，确保总数为8个
      let gameIcons = [...userIcons];
      if (gameIcons.length < 8) {
        // 添加适量emoji补充到8个
        const needToAdd = 8 - gameIcons.length;
        for (let i = 0; i < needToAdd; i++) {
          gameIcons.push(emojiIcons[i % emojiIcons.length]);
        }
      } else if (gameIcons.length > 8) {
        // 如果超过8个，截取前8个
        gameIcons = gameIcons.slice(0, 8);
      }
      
      // 过滤无效图标
      gameIcons = gameIcons.filter(icon => 
        icon && icon.displayValue !== undefined && icon.displayValue !== null
      );
      
      // 如果没有有效图标，使用默认图标
      if (gameIcons.length === 0) {
        gameIcons = emojiIcons;
      }
      
      // 第一步：将每列中的非空元素向下移动（让空格"上浮"）
      for (let col = 0; col < cols; col++) {
        // 收集这一列的所有非空方块
        const nonEmptyBlocks = [];
        for (let row = 0; row < rows; row++) {
          if (!newBoard[row][col].isEmpty) {
            nonEmptyBlocks.push({...newBoard[row][col]});
          }
        }
        
        // 从底部开始填充非空方块
        for (let row = rows - 1; row >= 0; row--) {
          if (rows - 1 - row < nonEmptyBlocks.length) {
            // 还有非空方块可以填充
            const block = nonEmptyBlocks[nonEmptyBlocks.length - 1 - (rows - 1 - row)];
            newBoard[row][col] = {...block, isDropping: true};
          } else {
            // 没有更多非空方块，设为空
            newBoard[row][col] = {isEmpty: true};
          }
        }
      }
      
      // 第二步：在顶部填充新的方块
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          if (newBoard[row][col].isEmpty) {
            // 随机选择图标
            const iconIndex = Math.floor(Math.random() * gameIcons.length);
            const newIcon = gameIcons[iconIndex];
            
            // 检查是否会自动形成匹配（只检查垂直和水平方向的三连）
            let willAutoMatch = false;
            
            // 检查垂直方向（上面的两个）
            if (row >= 2) {
              const above1 = newBoard[row-1][col];
              const above2 = newBoard[row-2][col];
              if (!above1.isEmpty && !above2.isEmpty) {
                const sameAsAbove1 = isSameIconValue(newIcon, above1.icon);
                const sameAsAbove2 = isSameIconValue(newIcon, above2.icon);
                if (sameAsAbove1 && sameAsAbove2) {
                  willAutoMatch = true;
                }
              }
            }
            
            // 检查水平方向（左边的两个）
            if (!willAutoMatch && col >= 2) {
              const left1 = newBoard[row][col-1];
              const left2 = newBoard[row][col-2];
              if (!left1.isEmpty && !left2.isEmpty) {
                const sameAsLeft1 = isSameIconValue(newIcon, left1.icon);
                const sameAsLeft2 = isSameIconValue(newIcon, left2.icon);
                if (sameAsLeft1 && sameAsLeft2) {
                  willAutoMatch = true;
                }
              }
            }
            
            // 是否允许自动匹配（降低到仅有5%的几率允许）
            const allowAutoMatch = Math.random() < 0.05;
            
            // 如果会自动匹配但不允许，则选择不会匹配的图标
            if (willAutoMatch && !allowAutoMatch) {
              // 尝试找一个不会匹配的图标
              const nonMatchingIcons = gameIcons.filter(icon => {
                // 垂直方向检查
                if (row >= 2) {
                  const above1 = newBoard[row-1][col];
                  const above2 = newBoard[row-2][col];
                  if (!above1.isEmpty && !above2.isEmpty) {
                    const sameAsAbove1 = isSameIconValue(icon, above1.icon);
                    const sameAsAbove2 = isSameIconValue(icon, above2.icon);
                    if (sameAsAbove1 && sameAsAbove2) {
                      return false;
                    }
                  }
                }
                
                // 水平方向检查
                if (col >= 2) {
                  const left1 = newBoard[row][col-1];
                  const left2 = newBoard[row][col-2];
                  if (!left1.isEmpty && !left2.isEmpty) {
                    const sameAsLeft1 = isSameIconValue(icon, left1.icon);
                    const sameAsLeft2 = isSameIconValue(icon, left2.icon);
                    if (sameAsLeft1 && sameAsLeft2) {
                      return false;
                    }
                  }
                }
                
                return true;
              });
              
              // 如果找到了不会自动匹配的图标，使用它
              if (nonMatchingIcons.length > 0) {
                const safeIconIndex = Math.floor(Math.random() * nonMatchingIcons.length);
                newBoard[row][col] = {
                  icon: nonMatchingIcons[safeIconIndex],
                  isEmpty: false,
                  isDropping: true
                };
              } else {
                // 如果所有图标都会匹配，还是使用随机图标
                newBoard[row][col] = {
                  icon: newIcon,
                  isEmpty: false,
                  isDropping: true
                };
              }
            } else {
              // 不会自动匹配或者允许自动匹配
              newBoard[row][col] = {
                icon: newIcon,
                isEmpty: false,
                isDropping: true
              };
            }
          }
        }
      }
      
      // 计算级联匹配的最大次数，避免无限级联
      setCascadeCount(0);
      
      // 移除下落状态
      setTimeout(() => {
        try {
          const updatedBoard = JSON.parse(JSON.stringify(newBoard));
          for (let row = 0; row < updatedBoard.length; row++) {
            for (let col = 0; col < updatedBoard[0].length; col++) {
              if (updatedBoard[row][col].isDropping) {
                updatedBoard[row][col].isDropping = false;
              }
            }
          }
          setBoard(updatedBoard);
        } catch (e) {
          console.error("更新棋盘状态出错:", e);
        }
      }, 500);
      
      return newBoard;
    } catch (error) {
      console.error("填充空格出错:", error);
      return gameBoard; // 出错时返回原始棋盘
    }
  };
  
  // 比较两个图标值是否相同（用于填充判断）
  const isSameIconValue = (icon1, icon2) => {
    try {
      if (!icon1 || !icon2 || 
          !icon1.displayValue || !icon2.displayValue) {
        return false;
      }
      
      // 比较两个图标对象
      if (typeof icon1.displayValue === 'object' && typeof icon2.displayValue === 'object') {
        // 如果是图片或文件类型，比较URL
        if (icon1.displayValue.type === 'image' && icon2.displayValue.type === 'image') {
          return icon1.displayValue.url === icon2.displayValue.url;
        }
        if (icon1.displayValue.type === 'file' && icon2.displayValue.type === 'file') {
          return icon1.displayValue.name === icon2.displayValue.name;
        }
        // 如果是选项字段，比较key值
        if (icon1.displayValue.type === 'option' && icon2.displayValue.type === 'option') {
          // 验证options数组存在
          if (!Array.isArray(icon1.displayValue.options) || 
              !Array.isArray(icon2.displayValue.options)) {
            return false;
          }
          
          // 如果两个都只有一个选项，比较选项的key
          if (icon1.displayValue.options.length === 1 && 
              icon2.displayValue.options.length === 1 &&
              icon1.displayValue.options[0] && 
              icon2.displayValue.options[0]) {
            return icon1.displayValue.options[0].key === icon2.displayValue.options[0].key;
          }
          // 如果选项数量不同，则不相同
          return false;
        }
        return false;
      }
      
      // 直接比较显示值
      return icon1.displayValue === icon2.displayValue;
    } catch (e) {
      console.error("比较图标值失败:", e);
      return false; // 出错时认为不相同
    }
  };
  
  // 处理单元格点击
  const handleCellClick = (row, col) => {
    if (gameOver || board[row][col].isEmpty) return;
    
    if (selectedCell) {
      // 检查是否相邻
      const isAdjacent = 
        (Math.abs(selectedCell.row - row) === 1 && selectedCell.col === col) || 
        (Math.abs(selectedCell.col - col) === 1 && selectedCell.row === row);
      
      if (isAdjacent) {
        // 相邻方块，允许交换
        // 交换单元格
        const newBoard = JSON.parse(JSON.stringify(board));
        const temp = newBoard[selectedCell.row][selectedCell.col];
        newBoard[selectedCell.row][selectedCell.col] = newBoard[row][col];
        newBoard[row][col] = temp;
        
        // 先更新棋盘展示交换效果
        setBoard(newBoard);
        
        // 扣除步数
        setMoves(prev => prev - 1);

        setTimeout(() => {
          const matches = findMatches(newBoard);
          if (matches.length > 0) {
            // 有匹配，消除并填充
            let currentBoard = clearMatches(newBoard, matches);
            setBoard(currentBoard);
            // 添加得分
            const matchesPoints = matches.length * 10;
            setScore(prev => prev + matchesPoints);
            // 添加得分弹窗
            if (matches.length > 0) {
              const firstMatch = matches[0][0];
              if (firstMatch) {
                setScorePopups(prev => [...prev, {
                  id: Date.now(),
                  points: matchesPoints,
                  position: { row: firstMatch.row, col: firstMatch.col }
                }]);
              }
            }
            // 延迟填充以显示消除动画
            setTimeout(() => {
              const filledBoard = fillEmptyCells(currentBoard, fieldIcons);
              setBoard(filledBoard);
              // 递归检查是否还有新的匹配产生
              setTimeout(() => {
                checkForCascadingMatches(filledBoard);
              }, 300);
            }, 300);
          }
          // 没有匹配，不做任何处理，棋盘保持交换后的状态
          // 不再交换回来
          // 检查是否游戏结束
          if (moves - 1 <= 0) {
            setGameOver(true);
          }
          // 重置选中的单元格
          setSelectedCell(null);
        }, 200);
      } else {
        // 不相邻，取消选择当前单元格，选择新单元格
        setSelectedCell({ row, col });
      }
    } else {
      // 选中单元格
      setSelectedCell({ row, col });
    }
  };
  
  // 检查连锁反应
  const checkForCascadingMatches = (gameBoard) => {
    // 确保游戏板不为空
    if (!gameBoard || !gameBoard.length) return;
    
    // 限制级联次数最多为3次
    const MAX_CASCADE = 3;
    if (cascadeCount >= MAX_CASCADE) {
      console.log(`已达到最大级联次数(${MAX_CASCADE})，停止自动消除`);
      setCascadeCount(0);
      return;
    }
    
    const matches = findMatches(gameBoard);
    
    if (matches.length > 0) {
      // 增加级联计数
      setCascadeCount(prev => prev + 1);
      
      // 有匹配，消除
      let currentBoard = clearMatches(gameBoard, matches);
      
      // 添加得分
      const matchesPoints = matches.length * 10;
      setScore(prev => prev + matchesPoints);
      
      // 添加得分弹窗
      if (matches.length > 0 && matches[0] && matches[0][0]) {
        const firstMatch = matches[0][0];
        setScorePopups(prev => [...prev, {
          id: Date.now(),
          points: matchesPoints,
          position: { row: firstMatch.row, col: firstMatch.col }
        }]);
      }
      
      // 延迟填充，让动画有时间显示
      setTimeout(() => {
        try {
          const filledBoard = fillEmptyCells(currentBoard, fieldIcons);
          setBoard(filledBoard);
          
          // 继续检查
          setTimeout(() => {
            // 递归调用，但设置最大递归深度防止无限循环
            if (matches.length > 0) {
              checkForCascadingMatches(filledBoard);
            }
          }, 300);
        } catch (e) {
          console.error("级联检查出错:", e);
        }
      }, 300);
    } else {
      // 没有更多匹配，重置级联计数
      setCascadeCount(0);
      
      // 检查是否游戏结束
      if (moves <= 0) {
        setGameOver(true);
      }
    }
  };
  
  // 处理双击事件 - 打开对应方块字段的数据
  const handleCellDoubleClick = (row, col) => {
    try {
      if (gameOver || !board || !board[row] || !board[row][col] || board[row][col].isEmpty) return;
      const cell = board[row][col];
      if (!cell || !cell.icon) return;
      if (!records || records.length === 0) return;
      const fieldInfo = cell.icon;
      // 精确查找：字段值与格子值完全相等的那条记录
      let foundRecord = null;
      for (const record of records) {
        if (!fieldInfo.fieldId) continue;
        // 兼容对象/选项/图片/文件等类型，使用JSON.stringify做深度比较
        if (record[fieldInfo.fieldId] !== undefined) {
          try {
            if (JSON.stringify(record[fieldInfo.fieldId]) === JSON.stringify(fieldInfo.value)) {
              foundRecord = record;
              break;
            }
          } catch (e) {}
        }
      }
      if (foundRecord && foundRecord.rowid) {
        utils.openRecordInfo({
          appId,
          worksheetId,
          viewId,
          recordId: foundRecord.rowid
        });
        return;
      }
      // 没找到则打开第一条
      if (records && records.length > 0 && records[0].rowid) {
        utils.openRecordInfo({
          appId,
          worksheetId,
          viewId,
          recordId: records[0].rowid
        });
      }
    } catch (error) {
      // 忽略异常
    }
  };
  
  // 显示单元格内容
  const renderCellContent = (cell, isCompactMode) => {
    try {
      if (cell.isEmpty) return null;
      
      const { icon } = cell;
      
      // 防止无效数据
      if (!icon || !icon.displayValue) {
        return <span className="text-content">--</span>;
      }
      
      // 如果是对象类型的displayValue（如图片）
      if (icon && typeof icon.displayValue === 'object') {
        // 图片类型
        if (icon.displayValue.type === 'image') {
          if (!icon.displayValue.url) {
            return <div className="text-content">图片</div>;
          }
          let hdUrl = icon.displayValue.originalUrl || icon.displayValue.previewUrl || icon.displayValue.url;
          if (typeof hdUrl === 'string' && hdUrl.includes('.mingdaoyun.cn')) {
            if (hdUrl.indexOf('imageView2') > -1) {
              hdUrl = hdUrl.replace(
                /imageView2\/\d\/w\/\d+(\/h\/\d+)?(\/q\/\d+)?/,
                'imageView2/2/w/240/q/100'
              );
            } else {
              hdUrl += (hdUrl.includes('?') ? '&' : '?') + 'imageView2/2/w/240/q/100';
            }
          }
          return (
            <img
              src={hdUrl}
              width={64}
              height={64}
              className={`cell-image cell-image-hd ${isCompactMode ? 'compact-image' : ''}`}
              style={{ 
                objectFit: 'cover', 
                width: '100%', 
                height: '100%',
                maxHeight: isCompactMode ? '100%' : 'none'
              }}
              loading="lazy"
              alt=""
            />
          );
        }
        
        // 文件类型
        if (icon.displayValue.type === 'file') {
          const fileName = icon.displayValue.name || '文件';
          return <div className="file-icon">{fileName.slice(0, 2)}</div>;
        }
        
        // 选项类型
        if (icon.displayValue.type === 'option') {
          if (!Array.isArray(icon.displayValue.options) || icon.displayValue.options.length === 0) {
            return <div className="text-content">选项</div>;
          }
          
          // 显示选项标签
          const option = icon.displayValue.options[0]; // 取第一个选项
          if (option) {
            return (
              <div 
                className="option-tag" 
                style={{ 
                  backgroundColor: option.color || '#f5f5f5', 
                  color: getContrastColor(option.color) 
                }}
              >
                {option.value || ''}
            </div>
            );
          }
          
          return <div className="text-content">选项</div>;
        }
        
        // 其他对象类型
        return <span className="text-content">{JSON.stringify(icon.displayValue).slice(0, 10)}...</span>;
      }
      
      // 判断是否为字符串类型内容
      const isTextContent = typeof icon.displayValue === 'string';
      const textValue = String(icon.displayValue || '');
      
      // 普通文本
      return <span className={isTextContent ? 'text-content' : ''}>{textValue}</span>;
    } catch (e) {
      console.error("渲染单元格内容失败:", e);
      return <span className="text-content">--</span>; // 出错时显示占位符
    }
  };
  
  // 根据背景色计算文字颜色
  const getContrastColor = (bgColor) => {
    if (!bgColor || bgColor === '#f5f5f5' || bgColor === '#ffffff' || bgColor === '#fff') {
      return '#666';
    }
    
    // 简单的亮度计算，如果背景色较深则返回白色文字，否则返回黑色文字
    try {
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#333' : '#fff';
    } catch (e) {
      return '#666';
    }
  };
  
  // 重启游戏
  const restartGame = () => {
    initGame(fieldIcons);
  };
  
  // 加载中
  if (loading) {
    return (
      <Container>
        <Header>
          <Title>宏观数据精检</Title>
        </Header>
        <LoadingContainer>
          正在加载数据，请稍候...
        </LoadingContainer>
      </Container>
    );
  }
  
  // 字母数组以用于表头
  const alphabet = Array.from({ length: cols }, (_, i) => 
    String.fromCharCode(65 + i)
  );
  
  // 计算方块显示位置的函数
  const calculatePosition = (rowIndex, colIndex) => {
    // 安全处理，防止除以0
    const rowPercent = rows > 0 ? (rowIndex / rows) * 100 : 0;
    const colPercent = cols > 0 ? ((colIndex + 1) / (cols + 1)) * 100 : 0;
    
    return {
      top: `${rowPercent}%`,
      left: `${colPercent}%`
    };
  };
  
  // 是否有可用数据记录
  const hasRecords = records && records.length > 0;
  
  return (
    <Container>
      <Header>
        <Title>宏观数据精检</Title>
        
        <InfoDisplay percent={scorePercent}>
          <div>Score: {score}</div>
          <div>Left: {moves}</div>
          <div className="complete">Record: {highScore}</div>
        </InfoDisplay>
      </Header>
      
      <GameBoard 
        className={`game-board md-table-view ${!isCompactMode ? 'scrollable-mode' : ''}`}
      >
        <TableHeader>
          <SideHeader></SideHeader>
          {alphabet.map((letter, index) => (
            <HeaderCell key={index}>{letter}</HeaderCell>
          ))}
        </TableHeader>
        
        <GameArea className={!isCompactMode ? 'scrollable-area' : ''}>
          {scorePopups.map(popup => {
            const position = calculatePosition(popup.position.row, popup.position.col);
            return (
              <ScorePopup 
                key={popup.id}
                className="score-animation"
                style={{
                  top: position.top,
                  left: position.left
                }}
              >
                +{popup.points}
              </ScorePopup>
            );
          })}
          
          {board.map((row, rowIndex) => (
            <Row key={rowIndex} className="row">
              <SideHeader>{rowIndex + 1}</SideHeader>
              {row.map((cell, colIndex) => {
                // 判断内容类型，用于样式调整
                const isTextContent = cell.icon && typeof cell.icon.displayValue === 'string';
                
                return (
                  <Cell
                    key={colIndex}
                    className={`
                      cell
                      ${animations.some(a => a.row === rowIndex && a.col === colIndex) ? 'cell-match' : ''}
                      ${selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'cell-selected' : ''}
                      ${cell.isDropping ? 'cell-drop' : ''}
                      cell-transition
                    `}
                    isSelected={selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex}
                    isEmpty={cell.isEmpty}
                    isTextContent={isTextContent}
                    isCompact={isCompactMode}
                    iscompact={isCompactMode ? "true" : "false"}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                    title="双击可查看数据"
                  >
                    {renderCellContent(cell, isCompactMode)}
                  </Cell>
                );
              })}
            </Row>
          ))}
        </GameArea>
      </GameBoard>
      
      {/* 游戏结束 */}
      {gameOver && (
        <GameOver>
          <GameOverTitle>游戏结束!</GameOverTitle>
          <div>你的得分是: <b>{score}</b> 分</div>
          {score === highScore && score > 0 && (
            <div style={{ color: '#f5222d', margin: '10px 0' }}>创造新纪录！</div>
          )}
          <RestartButton onClick={restartGame}>再来一局</RestartButton>
        </GameOver>
      )}
    </Container>
  );
}
