import React from 'react';

// 调整图片样式
const adjustImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  if (url.includes('.mingdaoyun.cn')) {
    if (url.indexOf('imageView2') > -1) {
      return url.replace(
        /imageView2\/\d\/w\/\d+(\/h\/\d+)?(\/q\/\d+)?/,
        'imageView2/2/w/240/q/100'
      );
    } else {
      return url + (url.includes('?') ? '&' : '?') + 'imageView2/2/w/240/q/100';
    }
  }
  
  return url;
};

// 解析复杂字段数据
export function parseFieldData(value, control) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 'undefined' ||
    value === '[]'
  ) {
    return '';
  }

  try {
    // 处理字符串类型的数据
    let parsedValue = value;
    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // 非JSON格式的字符串直接返回
        return value;
      }
    }

    // 处理数组类型的字段
    if (Array.isArray(parsedValue)) {
      if (parsedValue.length === 0) {
        return '';
      }

      // 处理人员字段、部门字段等
      const item = parsedValue[0];
      if (item && item.name) {
        return item.name;
      }
      if (item && item.fullname) {
        return item.fullname;
      }
      if (item && item.departmentName) {
        return item.departmentName;
      }

      // 处理附件字段
      if (item && item.fileId) {
        if (item.ext && ['.jpg', '.jpeg', '.png', '.gif'].includes(item.ext.toLowerCase())) {
          return { type: 'image', url: item.previewUrl || item.fileUrl };
        }
        return { type: 'file', name: item.originalFilename, url: item.fileUrl };
      }
    } 
    
    // 处理对象类型的字段
    else if (typeof parsedValue === 'object') {
      if (parsedValue.name) {
        return parsedValue.name;
      }
      if (parsedValue.fullname) {
        return parsedValue.fullname;
      }
      if (parsedValue.departmentName) {
        return parsedValue.departmentName;
      }
      
      // 处理单个附件字段
      if (parsedValue.fileId) {
        if (parsedValue.ext && ['.jpg', '.jpeg', '.png', '.gif'].includes(parsedValue.ext.toLowerCase())) {
          return { type: 'image', url: parsedValue.previewUrl || parsedValue.fileUrl };
        }
        return { type: 'file', name: parsedValue.originalFilename, url: parsedValue.fileUrl };
      }
    }

    // 处理选项字段（单选、多选、下拉列表）
    if (control && (control.type === 9 || control.type === 10 || control.type === 11)) {
      const options = control.options || [];
      
      // 处理单选和多选
      const keys = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
      
      const selectedOptions = keys
        .map(key => {
          const option = options.find(opt => {
            if (typeof key === 'string' && (key.indexOf('other') > -1 || key.indexOf('add_') > -1)) {
              return key.indexOf(opt.key) > -1;
            }
            return key === opt.key;
          });
          return option;
        })
        .filter(Boolean);
        
      if (selectedOptions.length > 0) {
        // 返回包含颜色信息的选项对象
        return {
          type: 'option',
          options: selectedOptions
        };
      }
    }

    if (control.type === 10) { // 附件
      if (value && value.length > 0) {
        const firstFile = value[0];
        if (firstFile.type === 'image') {
          return {
            type: 'image',
            url: adjustImageUrl(firstFile.url), // 优化图片URL
            name: firstFile.name
          };
        } else {
          return {
            type: 'file',
            name: firstFile.name || '文件',
            url: firstFile.url
          };
        }
      }
    }
  } catch (e) {
    console.error('Error parsing field data:', e);
    return String(value);
  }

  // 如果上述处理均不匹配，则尝试转为字符串显示
  return String(value);
}

// 展示字段内容的组件
export default function FieldDisplay({ value, control, isCompact }) {
  const displayValue = parseFieldData(value, control);
  
  if (!displayValue) return <div>--</div>;
  
  // 显示图片
  if (typeof displayValue === 'object' && displayValue.type === 'image') {
    return (
      <img 
        src={displayValue.url} 
        alt="附件" 
        style={{
          maxWidth: '100%', 
          maxHeight: isCompact ? '100%' : 'none',
          objectFit: 'cover',
          borderRadius: '6px'
        }} 
      />
    );
  }
  
  // 处理文件类型
  if (displayValue && typeof displayValue === 'object' && displayValue.type === 'file') {
    return <div className="file-icon">{displayValue.name}</div>;
  }
  
  // 处理选项字段
  if (displayValue && typeof displayValue === 'object' && displayValue.type === 'option') {
    return (
      <div className="option-tags">
        {displayValue.options.map(option => (
          <span 
            key={option.key} 
            className="option-tag"
            style={{ backgroundColor: option.color || '#f5f5f5', color: getContrastColor(option.color) }}
          >
            {option.value}
          </span>
        ))}
      </div>
    );
  }
  
  // 处理普通文本
  return <span>{displayValue}</span>;
}

// 根据背景色计算文字颜色
function getContrastColor(bgColor) {
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
} 