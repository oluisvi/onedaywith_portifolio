import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
CSS = (ROOT / 'styles.css').read_text(encoding='utf-8') + (ROOT / 'expansion.css').read_text(encoding='utf-8')

class PortfolioContentTests(unittest.TestCase):
    def test_second_reel_is_present(self):
        self.assertIn('Dcb4GaaTQ2X', HTML)

    def test_positioning_matches_client_answers(self):
        self.assertIn('criadora de conteúdo especializada em vídeos para redes sociais', HTML.lower())
        self.assertIn('captação', HTML.lower())
        self.assertIn('direção', HTML.lower())
        self.assertIn('estratég', HTML.lower())

    def test_services_are_explicit(self):
        for phrase in ('vídeos avulsos', 'roteiros', 'direção de conteúdo'):
            self.assertIn(phrase, HTML.lower())

    def test_service_area_and_travel_are_present(self):
        self.assertIn('jacareí', HTML.lower())
        self.assertIn('são josé dos campos', HTML.lower())
        self.assertIn('vale do paraíba', HTML.lower())
        self.assertIn('outras cidades', HTML.lower())

    def test_production_duration_is_present(self):
        self.assertIn('1h30', HTML.lower())
        self.assertIn('3h30', HTML.lower())

    def test_rico_defumados_case_is_present(self):
        self.assertIn('rico defumados', HTML.lower())
        self.assertIn('festa de paraibuna', HTML.lower())
        self.assertIn('antes de acabar', HTML.lower())

    def test_logo_and_real_media_are_used(self):
        expected_assets = (
            'assets/one-day-with-logo.webp',
            'assets/project-01-thumbnail.webp',
            'assets/project-02-thumbnail.webp',
            'assets/equipment-notebook.webp',
            'assets/equipment-kit.webp',
            'assets/equipment-studio.webp',
        )
        for asset in expected_assets:
            self.assertIn(asset, HTML)
            self.assertTrue((ROOT / asset).exists(), asset)

    def test_work_section_supports_multiple_projects(self):
        self.assertIn('work__projects', CSS)
        self.assertGreaterEqual(HTML.count('class="project-card'), 2)

if __name__ == '__main__':
    unittest.main()
