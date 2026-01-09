React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RefreshCw, Calculator, TrendingUp, Scale, CheckCircle } from 'lucide-react';

/**
 * Hook to load KaTeX script and stylesheet dynamically
 */
const useKaTeX = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent duplicate loading
    if (window.katex) {
      setIsLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    script.integrity = 'sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8';
    script.crossOrigin = 'anonymous';
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup not strictly necessary for single page app behavior here, 
      // but good practice would be to avoid removing if other components need it.
    };
  }, []);

  return isLoaded;
};

/**
 * Component to render LaTeX strings using KaTeX
 */
const Latex = ({ children, displayMode = false, isLoaded }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isLoaded && window.katex && containerRef.current) {
      try {
        window.katex.render(children, containerRef.current, {
          displayMode: displayMode,
          throwOnError: false,
        });
      } catch (e) {
        console.error("KaTeX render error:", e);
        containerRef.current.innerText = children; // Fallback
      }
    }
  }, [isLoaded, children, displayMode]);

  return <span ref={containerRef} className={`${displayMode ? 'block my-2 overflow-x-auto overflow-y-hidden' : ''}`}>{children}</span>;
};

const GLMVisualizer = () => {
  const [activeStep, setActiveStep] = useState(0);
  const isKaTeXLoaded = useKaTeX();

  const steps = [
    {
      id: 1,
      title: "初期化 (Initialization)",
      icon: <Calculator className="w-6 h-6 text-blue-500" />,
      desc: "パラメータの初期値を設定します。",
      math: "\\beta^{(0)}"
    },
    {
      id: 2,
      title: "線形予測子 & 平均 (Predict)",
      icon: <TrendingUp className="w-6 h-6 text-indigo-500" />,
      desc: "現在のパラメータで予測値を計算します。",
      math: "\\eta = X\\beta, \\quad \\mu = g^{-1}(\\eta)"
    },
    {
      id: 3,
      title: "作動変数 & 重み (Adjust)",
      icon: <Scale className="w-6 h-6 text-amber-500" />,
      desc: "局所的な直線近似のために、ターゲット変数(z)と重み(W)を計算します。",
      math: "z, \\quad W"
    },
    {
      id: 4,
      title: "WLSによる更新 (Update)",
      icon: <RefreshCw className="w-6 h-6 text-emerald-500" />,
      desc: "重みつき最小二乗法(WLS)を解いて、パラメータを更新します。",
      math: "\\beta^{(new)} = (X^T W X)^{-1} X^T W z"
    },
    {
      id: 5,
      title: "収束判定 (Check)",
      icon: <CheckCircle className="w-6 h-6 text-purple-500" />,
      desc: "パラメータの変化が十分に小さければ終了。そうでなければステップ2へ戻ります。",
      math: "|\\beta^{(new)} - \\beta^{(old)}| < \\epsilon"
    }
  ];

  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* Header Section */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">図解：反復重みつき最小二乗法 (IRLS)</h1>
        <p className="text-gray-600">一般化線形モデル(GLM)の最尤推定を解くためのアルゴリズム</p>
      </header>

      {/* Main Concept Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

        {/* Left Column: The Workflow Diagram */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-6 flex items-center text-blue-800 border-b pb-2">
            <RefreshCw className="mr-2" /> アルゴリズムの反復フロー
          </h2>
          
          <div className="relative">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`flex items-start mb-6 p-4 rounded-lg cursor-pointer transition-all duration-300 border-l-4 ${
                  activeStep === index 
                    ? 'bg-blue-50 border-blue-500 shadow-sm transform scale-102' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="mt-1 mr-4 p-2 bg-gray-100 rounded-full">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-bold ${activeStep === index ? 'text-blue-700' : 'text-gray-700'}`}>
                      Step {step.id}: {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{step.desc}</p>
                  <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-mono overflow-x-auto">
                    <Latex isLoaded={isKaTeXLoaded} displayMode={false}>{step.math}</Latex>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Visual loop connector */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-200 -z-10 dashed" />
          </div>

          <button 
            onClick={nextStep}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            次のステップへ進む <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Detailed Explanation & Math */}
        <div className="space-y-6">
          
          {/* Section: Why IRLS? */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-amber-400">
            <h3 className="text-lg font-bold mb-3 text-gray-800">なぜ IRLS が必要なのか？</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 leading-relaxed">
              <li>
                通常の線形回帰とは異なり、GLMの最尤推定方程式は<strong>非線形</strong>です。
              </li>
              <li>
                解析的（一発）に解けないため、<strong>ニュートン・ラフソン法</strong>（数値最適化手法）を使用します。
              </li>
              <li>
                このニュートン法を式変形すると、あたかも「重みつき最小二乗法」を繰り返し解いている形になるため、IRLSと呼ばれます。
              </li>
            </ul>
          </div>

          {/* Section: Mathematical Details */}
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
            <h3 className="text-lg font-bold mb-4 text-gray-800">数理的詳細（LaTeX）</h3>
            
            <div className="space-y-6">
              
              <div>
                <h4 className="font-bold text-sm text-indigo-600 mb-2">1. 線形予測子とリンク関数</h4>
                <p className="text-sm text-gray-600 mb-2">
                  説明変数の線形結合 <Latex isLoaded={isKaTeXLoaded}>{"\\eta"}</Latex> と、期待値 <Latex isLoaded={isKaTeXLoaded}>{"\\mu"}</Latex> をリンク関数 <Latex isLoaded={isKaTeXLoaded}>{"g"}</Latex> で繋ぎます。
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                  <Latex isLoaded={isKaTeXLoaded} displayMode={true}>
                    {"\\eta_i = \\mathbf{x}_i^T \\beta, \\quad \\eta_i = g(\\mu_i)"}
                  </Latex>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-amber-600 mb-2">2. 作動変数 (Working Dependent Variable) <Latex isLoaded={isKaTeXLoaded}>{"z"}</Latex></h4>
                <p className="text-sm text-gray-600 mb-2">
                  リンク関数の局所的な接線を使って、応答変数を線形空間に写像したものです。
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                  <Latex isLoaded={isKaTeXLoaded} displayMode={true}>
                    {"z_i = \\eta_i + (y_i - \\mu_i) \\frac{d\\eta_i}{d\\mu_i}"}
                  </Latex>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-emerald-600 mb-2">3. 重み行列 <Latex isLoaded={isKaTeXLoaded}>{"W"}</Latex></h4>
                <p className="text-sm text-gray-600 mb-2">
                  分散 <Latex isLoaded={isKaTeXLoaded}>{"V(\\mu)"}</Latex> とリンク関数の勾配に依存します。情報の精度を表します。
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                  <Latex isLoaded={isKaTeXLoaded} displayMode={true}>
                    {"W_{ii} = \\frac{1}{Var(Y_i)} \\left( \\frac{d\\mu_i}{d\\eta_i} \\right)^2"}
                  </Latex>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-blue-600 mb-2">4. 更新式 (ニュートン法の一歩)</h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                  <Latex isLoaded={isKaTeXLoaded} displayMode={true}>
                    {"\\beta^{(t+1)} = (X^T W^{(t)} X)^{-1} X^T W^{(t)} \\mathbf{z}^{(t)}"}
                  </Latex>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ※ これは重み <Latex isLoaded={isKaTeXLoaded}>{"W"}</Latex> と目的変数 <Latex isLoaded={isKaTeXLoaded}>{"z"}</Latex> を用いた重みつき最小二乗法(WLS)の解と同じ形です。
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GLMVisualizer;