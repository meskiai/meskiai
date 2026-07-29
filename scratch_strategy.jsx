// 1. Loading Step state and the multi_replace logic for state and localStorage
// 2. handleAnalyzeStrategy update
// 3. New Strategy UI

const [strategyLoadingStep, setStrategyLoadingStep] = useState(0);

// in handleAnalyzeStrategy:
    setIsAnalyzingStrategy(true);
    setStrategyLoadingStep(0);
    setStrategyResults(null);
    
    const stepsInterval = setInterval(() => {
      setStrategyLoadingStep(prev => prev < 4 ? prev + 1 : prev);
    }, 2500);

    try {
      // ... fetch calls
      const res = await fetch("/api/strategy/analyze", ...);
      const data = await res.json();
      
      clearInterval(stepsInterval);
      setStrategyLoadingStep(5);
// ...


// JSX replacement:
                {isAnalyzingStrategy && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: 'var(--subtext)' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                      <div className={styles.pulseRing} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--primary)', opacity: 0.2 }}></div>
                      <div className={styles.pulseRing} style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '2px solid var(--primary)', opacity: 0.4, animationDelay: '0.5s' }}></div>
                      <div className={styles.pulseRing} style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '2px solid var(--primary)', opacity: 0.6, animationDelay: '1s' }}></div>
                      <div style={{ background: 'var(--card-bg)', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--mac-shadow)', zIndex: 10 }}>
                        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '16px' }}>
                      {strategyLoadingStep === 0 && "Skanowanie infrastruktury strony..."}
                      {strategyLoadingStep === 1 && "Pobieranie danych rynkowych..."}
                      {strategyLoadingStep === 2 && "Analiza słów kluczowych i CPC..."}
                      {strategyLoadingStep === 3 && "Modelowanie strategii konkurencji..."}
                      {strategyLoadingStep === 4 && "Generowanie raportu Big 4..."}
                      {strategyLoadingStep === 5 && "Zakończono analizę."}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div key={step} style={{ width: '40px', height: '4px', borderRadius: '2px', background: strategyLoadingStep >= step ? 'var(--primary)' : 'rgba(120,120,128,0.2)', transition: 'background 0.3s' }}></div>
                      ))}
                    </div>
                  </div>
                )}

                {strategyResults && !isAnalyzingStrategy && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* KEY METRICS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(30px)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Trudność SEO</div>
                          <TrendingUp size={20} style={{ color: '#3b82f6' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-1px' }}>{strategyResults.keyMetrics?.seoDifficulty || 0}</span>
                          <span style={{ color: 'var(--subtext)', fontSize: '1rem', fontWeight: 500 }}>/ 100</span>
                        </div>
                        <div style={{ marginTop: '16px', height: '6px', background: 'rgba(120,120,128,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${strategyResults.keyMetrics?.seoDifficulty || 0}%`, background: strategyResults.keyMetrics?.seoDifficulty > 70 ? '#ff3b30' : strategyResults.keyMetrics?.seoDifficulty > 40 ? '#ff9500' : '#34c759', borderRadius: '3px' }}></div>
                        </div>
                      </div>

                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(30px)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Średni CPC</div>
                          <DollarSign size={20} style={{ color: '#10b981' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-1px' }}>{strategyResults.keyMetrics?.averageCpc || "N/A"}</span>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--subtext)' }}>
                          Szacowany koszt kliknięcia w Google Ads
                        </div>
                      </div>

                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'rgba(255, 149, 0, 0.1)', filter: 'blur(30px)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Trend Rynku</div>
                          <Activity size={20} style={{ color: '#ff9500' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-1px' }}>{strategyResults.marketOverview?.estimatedGrowth || "Stabilny"}</span>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--subtext)' }}>
                          {strategyResults.marketOverview?.mainTrend || "Ogólny trend wzrostowy w branży"}
                        </div>
                      </div>

                    </div>

                    {/* SWOT ANALYSIS */}
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)' }}>
                      <div style={{ fontSize: '0.95rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>Podsumowanie Wykonawcze</div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 32px 0' }}>Analiza SWOT & Pozycja Rynkowa</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                        
                        {/* Strengths */}
                        <div style={{ background: 'rgba(52, 199, 89, 0.05)', border: '1px solid rgba(52, 199, 89, 0.2)', borderRadius: '12px', padding: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#34c759' }}>
                            <ArrowUpRight size={24} />
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Mocne Strony</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {strategyResults.swotAnalysis?.strengths?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5 }}>
                                <div style={{ color: '#34c759', flexShrink: 0 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div style={{ background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: '12px', padding: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ff3b30' }}>
                            <ArrowDownRight size={24} />
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Słabe Strony</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {strategyResults.swotAnalysis?.weaknesses?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5 }}>
                                <div style={{ color: '#ff3b30', flexShrink: 0 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Opportunities */}
                        <div style={{ background: 'rgba(0, 122, 255, 0.05)', border: '1px solid rgba(0, 122, 255, 0.2)', borderRadius: '12px', padding: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#007aff' }}>
                            <Zap size={24} />
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Szanse</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {strategyResults.swotAnalysis?.opportunities?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5 }}>
                                <div style={{ color: '#007aff', flexShrink: 0 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Threats */}
                        <div style={{ background: 'rgba(255, 149, 0, 0.05)', border: '1px solid rgba(255, 149, 0, 0.2)', borderRadius: '12px', padding: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#ff9500' }}>
                            <ShieldAlert size={24} />
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Zagrożenia</h4>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {strategyResults.swotAnalysis?.threats?.map((item: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5 }}>
                                <div style={{ color: '#ff9500', flexShrink: 0 }}>•</div>{item}
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                      
                      <div style={{ marginTop: '24px', padding: '16px 24px', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--foreground)' }}>
                        <strong>Werdykt AI:</strong> {strategyResults.marketOverview?.summary}
                      </div>
                    </div>

                    {/* COMPETITORS & ACTION PLAN */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                      
                      {/* Competitors Table/Cards */}
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)', flex: 2 }}>
                        <div style={{ fontSize: '0.95rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>Mapa Rynku</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 24px 0' }}>Główni Konkurenci</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {strategyResults.competitors?.map((comp: any, i: number) => (
                            <div key={i} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(120,120,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>
                                    <Target size={20} />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--foreground)' }}>{comp.name}</div>
                                    <a href={comp.url?.startsWith('http') ? comp.url : `https://${comp.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>{comp.url}</a>
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--subtext)', textAlign: 'right' }}>
                                  <div>Szacowany Ruch</div>
                                  <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{comp.trafficEstimate}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                <div><span style={{ color: 'var(--subtext)' }}>Przewaga:</span> <span style={{ color: 'var(--foreground)' }}>{comp.mainAdvantage}</span></div>
                                <div><span style={{ color: 'var(--subtext)' }}>Ich luka:</span> <span style={{ color: '#007aff', fontWeight: 500 }}>{comp.strategyGap}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Plan */}
                      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--mac-shadow), var(--glass-reflection)', backdropFilter: 'saturate(200%) blur(30px)', WebkitBackdropFilter: 'saturate(200%) blur(30px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.95rem', color: 'var(--subtext)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>Rekomendacje</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckSquare size={24} style={{ color: '#34c759' }} /> Action Plan
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                          {strategyResults.actionPlan?.map((plan: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(52, 199, 89, 0.1)', color: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, marginTop: '2px' }}>
                                {i + 1}
                              </div>
                              <div style={{ fontSize: '1.05rem', color: 'var(--foreground)', lineHeight: 1.6 }}>
                                {plan}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => { setDashboardMode("CLIENTS"); setCurrentTab("CLIENTS" as any); }}
                          style={{ marginTop: '32px', width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--ambient-2))', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(59,130,246,0.3)' }}
                        >
                          Generuj Leady B2B <ArrowRight size={20} />
                        </button>
                      </div>

                    </div>
                    
                  </div>
                )}
