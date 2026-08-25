import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
SCRIPT = (ROOT / 'script.js').read_text(encoding='utf-8')
MEDIA_DATA = (ROOT / 'media-data.js').read_text(encoding='utf-8') if (ROOT / 'media-data.js').exists() else ''
CSS = (ROOT / 'styles.css').read_text(encoding='utf-8') + (ROOT / 'expansion.css').read_text(encoding='utf-8')

class MediaGalleryTests(unittest.TestCase):
    def test_each_project_has_real_thumbnail(self):
        self.assertIn('assets/project-01-thumbnail.webp', HTML)
        self.assertIn('assets/project-02-thumbnail.webp', HTML)
        self.assertTrue((ROOT / 'assets/project-01-thumbnail.webp').exists())
        self.assertTrue((ROOT / 'assets/project-02-thumbnail.webp').exists())

    def test_each_project_exposes_behind_the_scenes_action(self):
        self.assertGreaterEqual(HTML.count('data-open-gallery='), 2)
        self.assertIn('data-open-gallery="project-01"', HTML)
        self.assertIn('data-open-gallery="project-02"', HTML)
        self.assertGreaterEqual(HTML.lower().count('ver bastidores'), 2)

    def test_generic_modal_carousel_shell_exists(self):
        self.assertIn('data-media-lightbox', HTML)
        self.assertIn('data-carousel-track', HTML)
        self.assertIn('data-carousel-prev', HTML)
        self.assertIn('data-carousel-next', HTML)
        self.assertIn('data-carousel-counter', HTML)
        self.assertIn('aria-modal="true"', HTML)

    def test_project_one_media_is_mapped_separately(self):
        self.assertIn('project-01', MEDIA_DATA)
        self.assertIn('assets/project-01-thumbnail.webp', MEDIA_DATA)
        self.assertIn('assets/project-01-bts-phone.webp', MEDIA_DATA)
        self.assertNotIn('assets/rico-bts-video-01.mp4', MEDIA_DATA.split('project-02')[0])

    def test_project_two_contains_food_photos_and_both_videos(self):
        for asset in (
            'assets/project-02-thumbnail.webp',
            'assets/rico-bts-filming-color.webp',
            'assets/rico-bts-filming-bw.webp',
            'assets/rico-bts-menu.webp',
            'assets/rico-bts-meat.webp',
            'assets/rico-bts-video-01.mp4',
            'assets/rico-bts-video-02.mp4',
        ):
            self.assertIn(asset, MEDIA_DATA)
            self.assertTrue((ROOT / asset).exists(), asset)

    def test_equipment_media_is_present_as_its_own_horizontal_rail(self):
        self.assertIn('equipment-rail', HTML)
        for asset in (
            'assets/equipment-notebook.webp',
            'assets/equipment-kit.webp',
            'assets/equipment-studio.webp',
        ):
            self.assertIn(asset, HTML)
            self.assertTrue((ROOT / asset).exists(), asset)

    def test_video_sources_are_lazy_hydrated(self):
        self.assertIn('data-video-src', SCRIPT)
        self.assertIn('preload="metadata"', SCRIPT)
        self.assertIn('removeAttribute("src")', SCRIPT)

    def test_carousel_pauses_video_when_slide_changes_or_modal_closes(self):
        self.assertIn('.pause()', SCRIPT)
        self.assertIn('data-carousel-index', SCRIPT)
        self.assertIn('overflow = "hidden"', SCRIPT)

    def test_carousel_supports_touch_scroll_and_snap(self):
        self.assertIn('scroll-snap-type', CSS)
        self.assertIn('overflow-x: auto', CSS)
        self.assertIn('touch-action', CSS)

if __name__ == '__main__':
    unittest.main()
